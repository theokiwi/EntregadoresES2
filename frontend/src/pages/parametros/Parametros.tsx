import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listarUnidades } from '../../api/unidades';
import { Card, Field, inputClass } from '../../components/ui';
import { ParametrizarCustos } from './ParametrizarCustos';
import { ParametrizarJornada } from './ParametrizarJornada';

export function Parametros() {
  const unidades = useQuery({ queryKey: ['unidades'], queryFn: listarUnidades });
  const [unidadeId, setUnidadeId] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <Card title="Selecionar unidade">
        <Field label="Unidade">
          <select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} className={inputClass}>
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
      </Card>

      {unidadeId && (
        <div className="grid gap-6 md:grid-cols-2">
          <ParametrizarCustos unidadeId={unidadeId} />
          <ParametrizarJornada unidadeId={unidadeId} />
        </div>
      )}
    </div>
  );
}
