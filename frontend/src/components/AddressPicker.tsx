import L, { type Map as LeafletMap, type Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { inputClass } from './ui';

type Coordinates = { latitude: number; longitude: number };
type AddressPickerProps = {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coordinates: Coordinates) => void;
  required?: boolean;
  placeholder?: string;
};
type GeoapifyResult = { formatted: string; lat: number; lon: number; address_line1?: string; address_line2?: string };

const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;

async function geocode(endpoint: 'autocomplete' | 'reverse', params: Record<string, string>, signal?: AbortSignal) {
  if (!apiKey) throw new Error('Configure VITE_GEOAPIFY_API_KEY para habilitar a busca de endereços.');
  const query = new URLSearchParams({ ...params, format: 'json', apiKey });
  const response = await fetch(`https://api.geoapify.com/v1/geocode/${endpoint}?${query}`, { signal });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'A chave do Geoapify foi recusada.' : 'Não foi possível consultar o endereço.');
  return response.json() as Promise<{ results?: GeoapifyResult[] }>;
}

export function AddressPicker({ value, onChange, onCoordinatesChange, required, placeholder = 'Comece a digitar o endereço' }: AddressPickerProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const mapInitialRef = useRef<{ address: string; coordinates: Coordinates | null }>({ address: value, coordinates: null });
  const [suggestions, setSuggestions] = useState<GeoapifyResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [error, setError] = useState(apiKey ? '' : 'Geoapify não configurado.');
  const [selectedAddress, setSelectedAddress] = useState(value);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!apiKey || value.trim().length < 3 || value === selectedAddress) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      geocode('autocomplete', { text: value, filter: 'countrycode:br', limit: '6', lang: 'pt' }, controller.signal)
        .then((data) => { setSuggestions(data.results ?? []); setError(''); })
        .catch((reason: Error) => { if (reason.name !== 'AbortError') setError(reason.message); })
        .finally(() => setIsSearching(false));
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [value, selectedAddress]);

  function chooseResult(result: GeoapifyResult) {
    const coordinates = { latitude: result.lat, longitude: result.lon };
    setSelectedAddress(result.formatted);
    setSelectedCoordinates(coordinates);
    setSuggestions([]);
    onChange(result.formatted);
    onCoordinatesChange?.(coordinates);
  }

  useEffect(() => {
    if (!isMapOpen || !mapElementRef.current || !apiKey) return;
    const initialSelection = mapInitialRef.current;
    const initial = initialSelection.coordinates ?? { latitude: -19.9167, longitude: -43.9345 };
    const map = L.map(mapElementRef.current, { zoomControl: true }).setView([initial.latitude, initial.longitude], initialSelection.coordinates ? 17 : 12);
    L.tileLayer(`https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${encodeURIComponent(apiKey)}`, {
      attribution: '© OpenStreetMap contributors · © Geoapify',
      maxZoom: 20,
    }).addTo(map);
    const marker = L.marker([initial.latitude, initial.longitude]).addTo(map);
    mapRef.current = map;
    markerRef.current = marker;
    window.setTimeout(() => map.invalidateSize(), 0);

    map.on('click', async (event: L.LeafletMouseEvent) => {
      marker.setLatLng(event.latlng);
      setSelectedCoordinates({ latitude: event.latlng.lat, longitude: event.latlng.lng });
      try {
        const data = await geocode('reverse', { lat: String(event.latlng.lat), lon: String(event.latlng.lng), lang: 'pt' });
        if (data.results?.[0]) { setSelectedAddress(data.results[0].formatted); setError(''); }
        else setError('Não foi possível identificar o endereço deste ponto.');
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível consultar o endereço.'); }
    });

    if (initialSelection.address && !initialSelection.coordinates) {
      geocode('autocomplete', { text: initialSelection.address, filter: 'countrycode:br', limit: '1', lang: 'pt' })
        .then((data) => {
          const result = data.results?.[0];
          if (!result || !mapRef.current || !markerRef.current) return;
          mapRef.current.setView([result.lat, result.lon], 17);
          markerRef.current.setLatLng([result.lat, result.lon]);
          setSelectedAddress(result.formatted);
          setSelectedCoordinates({ latitude: result.lat, longitude: result.lon });
        })
        .catch((reason: Error) => setError(reason.message));
    }

    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, [isMapOpen]);

  useEffect(() => {
    if (!isMapOpen) return;
    const mapTrigger = mapTriggerRef.current;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMapOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      mapTrigger?.focus();
    };
  }, [isMapOpen]);

  function openMap() {
    const coordinates = value === selectedAddress ? selectedCoordinates : null;
    mapInitialRef.current = { address: value, coordinates };
    if (!coordinates) setSelectedCoordinates(null);
    setSelectedAddress(value);
    setSuggestions([]);
    setIsMapOpen(true);
  }

  function confirmMapSelection() {
    if (!selectedCoordinates || !selectedAddress) return;
    onChange(selectedAddress);
    onCoordinatesChange?.(selectedCoordinates);
    setIsMapOpen(false);
  }

  return (
    <>
      <div className="address-picker">
        <div className="address-search">
          <input required={required} value={value} onChange={(event) => { setSuggestions([]); setIsSearching(false); onChange(event.target.value); }} className={inputClass} placeholder={placeholder} autoComplete="off" role="combobox" aria-autocomplete="list" aria-controls="address-suggestions" aria-expanded={suggestions.length > 0} />
          {isSearching && <span className="address-searching" role="status">Buscando…</span>}
          {suggestions.length > 0 && (
            <ul id="address-suggestions" className="address-suggestions" role="listbox">
              {suggestions.map((result, index) => (
                <li key={`${result.lat}-${result.lon}-${index}`}>
                  <button type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => chooseResult(result)}>
                    <strong>{result.address_line1 ?? result.formatted}</strong>
                    {result.address_line2 && <span>{result.address_line2}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button ref={mapTriggerRef} type="button" className="btn btn-secondary address-map-button" onClick={openMap} disabled={!apiKey} aria-label="Selecionar endereço no mapa"><span aria-hidden>⌖</span> Selecionar no mapa</button>
      </div>
      {error && <small className="address-picker-error" role="alert">{error}</small>}

      {isMapOpen && (
        <div className="map-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsMapOpen(false)}>
          <section className="map-dialog" role="dialog" aria-modal="true" aria-labelledby="map-dialog-title">
            <div className="map-dialog-header"><div><h2 id="map-dialog-title">Selecionar endereço</h2><p>Clique no ponto exato do mapa. Pressione Escape para cancelar.</p></div><button ref={closeButtonRef} type="button" onClick={() => setIsMapOpen(false)} aria-label="Fechar seletor de endereço">×</button></div>
            <div ref={mapElementRef} className="address-map" />
            <div className="map-dialog-footer">
              <p>{selectedCoordinates ? selectedAddress : 'Selecione um ponto no mapa para continuar.'}</p>
              <div><button type="button" className="btn btn-secondary" onClick={() => setIsMapOpen(false)}>Cancelar</button><button type="button" className="btn btn-primary" onClick={confirmMapSelection} disabled={!selectedCoordinates || !selectedAddress}>Usar este endereço</button></div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
