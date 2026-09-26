import { useQuery } from '@tanstack/react-query';
import { consultarMeuRanking } from '../../api/dashboard';
import { mensagemDeErro } from '../../api/error';
import { Card, EmptyState, ErrorText, Icon } from '../../components/ui';

export function MeuRanking() {
  const ranking = useQuery({ queryKey: ['meu-ranking'], queryFn: consultarMeuRanking });

  if (ranking.isLoading) {
    return <Card><p className="text-sm text-stone-400" role="status">Calculando seu ranking mensal…</p></Card>;
  }
  if (ranking.isError) return <ErrorText>{mensagemDeErro(ranking.error)}</ErrorText>;
  if (!ranking.data) return null;

  const dados = ranking.data;
  const mes = new Date(`${dados.periodo.dataInicial.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', { month: 'long' });

  return <section className="driver-game" aria-labelledby="ranking-title">
    <div className="driver-game-hero">
      <div>
        <p className="eyebrow">Desafio de {mes}</p>
        <h2 id="ranking-title">Você está em <strong>{dados.minhaPosicao ? `${dados.minhaPosicao}º lugar` : 'fase de estreia'}</strong></h2>
        <p>{dados.minhaPosicao === 1 && dados.minhaPontuacao > 0
          ? 'Você lidera a equipe. Continue nesse ritmo!'
          : dados.pontosParaSubir > 0
            ? `Faltam ${dados.pontosParaSubir} pontos para subir uma posição.`
            : 'Conclua sua primeira rota para entrar na disputa.'}</p>
      </div>
      <div className="driver-score"><span><Icon name="chart" /></span><strong>{dados.minhaPontuacao}</strong><small>pontos</small></div>
    </div>

    <div className="driver-game-grid">
      <Card title="Ranking da equipe" subtitle={`${dados.totalParticipantes} participantes · atualizado com rotas finalizadas`}>
        {!dados.ranking.length ? <EmptyState icon="users" title="Equipe sem participantes" description="O ranking aparecerá quando houver entregadores ativos." /> :
          <ol className="ranking-list driver-ranking">{dados.ranking.map((item) => <li key={item.entregadorId} className={item.souEu ? 'is-me' : ''} aria-current={item.souEu ? 'true' : undefined}>
            <span className="ranking-position">{item.posicao}</span>
            <div><strong>{item.nome}{item.souEu && <em>Você</em>}</strong><span><i style={{ width: `${item.pontuacao}%` }} /></span></div>
            <b>{item.pontuacao}</b>
          </li>)}</ol>}
        <p className="privacy-note">Aqui aparecem somente posição e pontos. Dados financeiros e renda são sempre privados.</p>
      </Card>

      <div className="driver-side">
        <Card title="Meu desempenho" subtitle="Seus números no mês">
          <dl className="driver-metrics">
            <div><dt>Rotas</dt><dd>{dados.meuDesempenho.rotasConcluidas}</dd></div>
            <div><dt>Distância</dt><dd>{dados.meuDesempenho.distanciaKm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km</dd></div>
            <div><dt>Tempo médio parado</dt><dd>{Math.round(dados.meuDesempenho.tempoMedioParadoMin)} min/rota</dd></div>
          </dl>
        </Card>
        <Card title="Conquistas" subtitle="Marcos desbloqueados neste mês">
          {dados.conquistas.length ? <ul className="achievement-list">{dados.conquistas.map((item) => <li key={item.codigo}><span>★</span><div><strong>{item.titulo}</strong><small>{item.descricao}</small></div></li>)}</ul> : <p className="achievement-empty">Sua próxima conquista está a caminho. Continue concluindo rotas!</p>}
        </Card>
      </div>
    </div>
    <p className="ranking-method">Como os pontos são calculados: {dados.criterio} A comparação considera apenas sua equipe e nunca utiliza renda.</p>
  </section>;
}
