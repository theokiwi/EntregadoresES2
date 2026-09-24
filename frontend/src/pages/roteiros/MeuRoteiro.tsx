import { useQuery } from '@tanstack/react-query';
import { consultarRoteiroDeHoje } from '../../api/roteiros';
import { Card } from '../../components/ui';

const ROTULO_STATUS: Record<string, string> = {
  PENDENTE: 'Pendente',
  AGUARDANDO_SAIDA: 'Aguardando saída',
  CONCLUIDO: 'Concluído',
};

/** UC10 — Consultar roteiro do dia: TelaRoteiroDoDia. */
export function MeuRoteiro() {
  const roteiro = useQuery({ queryKey: ['roteiro-hoje'], queryFn: consultarRoteiroDeHoje });

  return (
    <Card title="Meu roteiro do dia">
      {roteiro.isLoading && <p className="text-sm text-slate-500">Carregando…</p>}
      {!roteiro.isLoading && !roteiro.data && (
        <p className="text-sm text-slate-500">Nenhum roteiro disponível para hoje.</p>
      )}
      {roteiro.data && (
        <ol className="flex flex-col gap-2">
          {roteiro.data.itens.map((item) => (
            <li key={item.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
              <p className="font-medium text-slate-800">
                {item.ordem}. {item.ponto.endereco}
              </p>
              <p className="text-slate-500">{ROTULO_STATUS[item.status]}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
