import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { registrarPedido } from '../../api/pedidos';
import { listarUnidades } from '../../api/unidades';
import { useAuth } from '../../auth/AuthContext';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';
import { AddressPicker } from '../../components/AddressPicker';

/** UC08 — Registrar pedidos/endereços de entrega: TelaRegistroDePedidos. */
export function RegistrarPedido() {
  const { sessao } = useAuth();
  const precisaSelecionarUnidade = !sessao?.unidadeId;

  const unidades = useQuery({ queryKey: ['unidades'], queryFn: listarUnidades, enabled: precisaSelecionarUnidade });

  const [unidadeId, setUnidadeId] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [resultado, setResultado] = useState<'reaproveitado' | 'criado' | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      registrarPedido({
        endereco,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        unidadeId: precisaSelecionarUnidade ? unidadeId : undefined,
      }),
    onSuccess: (resposta) => {
      setResultado(resposta.reaproveitado ? 'reaproveitado' : 'criado');
      setEndereco('');
      setLatitude('');
      setLongitude('');
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setResultado(null);
    mutation.mutate();
  }

  return (
    <Card title="Registrar endereço de entrega">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {precisaSelecionarUnidade && (
          <Field label="Unidade">
            <select required value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} className={inputClass}>
              <option value="" disabled>
                Selecione…
              </option>
              {unidades.data?.map((unidade) => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Endereço do pedido">
          <AddressPicker
            required
            value={endereco}
            onChange={setEndereco}
            onCoordinatesChange={({ latitude: lat, longitude: lng }) => {
              setLatitude(lat.toFixed(6));
              setLongitude(lng.toFixed(6));
            }}
          />
        </Field>
        <p className="text-xs text-slate-500">
          Latitude/longitude só são necessárias se o endereço ainda não existir na base de Pontos.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude (opcional)">
            <input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Longitude (opcional)">
            <input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
        {resultado === 'reaproveitado' && <SuccessText>Endereço já existia — Ponto reaproveitado.</SuccessText>}
        {resultado === 'criado' && <SuccessText>Endereço novo — Ponto cadastrado.</SuccessText>}
        <PrimaryButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Registrando…' : 'Registrar pedido'}
        </PrimaryButton>
      </form>
    </Card>
  );
}
