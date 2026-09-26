import { useEffect, useState } from 'react';
import * as api from '../api/assinaturas';
import type { Assinatura, Plano } from '../api/assinaturas';
import { mensagemDeErro } from '../api/error';
import { Card, ErrorText, Icon, PrimaryButton, StatusBadge, SuccessText } from '../components/ui';

export function MinhaAssinatura() {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null); const [planos, setPlanos] = useState<Plano[]>([]); const [erro, setErro] = useState<string | null>(null); const [sucesso, setSucesso] = useState(false);
  useEffect(() => { Promise.all([api.consultar(), api.listarPlanos()]).then(([a, p]) => { setAssinatura(a); setPlanos(p); }).catch((e) => setErro(mensagemDeErro(e))); }, []);
  async function mudar(plano: Plano['codigo']) { setErro(null); setSucesso(false); try { setAssinatura(await api.alterarPlano(plano)); setSucesso(true); } catch (e) { setErro(mensagemDeErro(e)); } }
  function limite(valor: number, singular: string, plural: string) {
    return `${valor} ${valor === 1 ? singular : plural}`;
  }
  if (erro && !assinatura) return <ErrorText>{erro}</ErrorText>;
  return <div className="subscription-layout">{assinatura && <Card className="subscription-current"><div className="subscription-title"><div><p className="eyebrow">Plano atual</p><h2>{planos.find((p) => p.codigo === assinatura.plano)?.nome ?? assinatura.plano}</h2></div><StatusBadge tone="success">{assinatura.status}</StatusBadge></div><strong className="subscription-price">R$ {assinatura.valorMensal.toFixed(2).replace('.', ',')}<small>/mês</small></strong><dl><div><dt>Próxima renovação</dt><dd>{new Date(assinatura.proximaCobranca).toLocaleDateString('pt-BR')}</dd></div><div><dt>Forma de pagamento</dt><dd>Cartão final {assinatura.cartaoFinal}</dd></div></dl><div className="mock-notice compact"><Icon name="shield"/><div><strong>Ambiente demonstrativo</strong><p>Pagamento e renovações são simulados; não há cobrança real.</p></div></div></Card>}<section><h2 className="section-title">Alterar plano</h2><div className="subscription-plans">{planos.map((plano) => <Card key={plano.codigo} className={assinatura?.plano === plano.codigo ? 'active-plan' : ''}><h3>{plano.nome}</h3><strong>R$ {plano.valorMensal}<small>/mês</small></strong><p>{limite(plano.limiteEntregadores, 'entregador', 'entregadores')} · {limite(plano.limiteUnidades, 'unidade', 'unidades')}</p><PrimaryButton disabled={assinatura?.plano === plano.codigo} onClick={() => mudar(plano.codigo)}>{assinatura?.plano === plano.codigo ? 'Plano atual' : 'Mudar para este plano'}</PrimaryButton></Card>)}</div>{erro && <ErrorText>{erro}</ErrorText>}{sucesso && <SuccessText>Plano alterado com sucesso. A alteração simulada já está ativa.</SuccessText>}</section></div>;
}
