import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { consultarAuditoria } from '../../api/auditoria';
import { Card, EmptyState, ErrorText, Field, inputClass } from '../../components/ui';
import { mensagemDeErro } from '../../api/error';

/** UC17 — Consultar trilha de auditoria: TelaTrilhaDeAuditoria. */
export function TrilhaDeAuditoria() {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  const auditoria = useQuery({
    queryKey: ['auditoria', dataInicial, dataFinal],
    queryFn: () =>
      consultarAuditoria({
        dataInicial: dataInicial ? new Date(dataInicial).toISOString() : undefined,
        dataFinal: dataFinal ? new Date(dataFinal).toISOString() : undefined,
      }),
  });

  return (
    <div className="flex flex-col gap-6">
      <Card title="Filtrar período">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Data inicial">
            <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Data final">
            <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-slate-500">Sem período informado, mostra os últimos 30 dias.</p>
      </Card>

      <Card title="Correções registradas">
        {auditoria.isLoading && <p className="text-sm text-slate-500" role="status">Carregando registros…</p>}
        {auditoria.isError && <ErrorText>{mensagemDeErro(auditoria.error)}</ErrorText>}
        {auditoria.data?.length === 0 && (
          <EmptyState icon="audit" title="Nenhuma correção encontrada" description="Ajuste o período ou aguarde o registro de novas correções." />
        )}
        <ul className="flex flex-col gap-2">
          {auditoria.data?.map((registro) => (
            <li key={registro.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
              <p className="font-medium text-slate-800">
                {registro.itemRoteiro?.ponto.endereco ?? registro.entidade} — {registro.campo}
              </p>
              <p className="text-slate-500">
                {registro.valorAnterior} → {registro.valorNovo}
              </p>
              <p className="text-slate-500">
                {registro.autor.nome} em {new Date(registro.dataHoraCorrecao).toLocaleString('pt-BR')}
              </p>
              {registro.justificativa && <p className="mt-1 italic text-slate-600">"{registro.justificativa}"</p>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
