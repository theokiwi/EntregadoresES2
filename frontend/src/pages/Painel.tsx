import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/ui';
import { MeuRoteiro } from './roteiros/MeuRoteiro';

/**
 * Página inicial. Para Entregador, é diretamente "Meu roteiro do dia" (UC10, gatilho:
 * "acessa a tela inicial do aplicativo"). O dashboard de Supervisor (UC18) chega na
 * fase C6 — até lá, a home de Supervisor lista os atalhos disponíveis.
 */
export function Painel() {
  const { sessao } = useAuth();

  if (sessao?.perfil === 'ENTREGADOR') {
    return <MeuRoteiro />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Planejamento do dia (C3)">
        <ul className="flex flex-col gap-2 text-sm text-slate-700">
          <li>
            <Link className="text-slate-900 underline" to="/pedidos">
              Registrar pedidos/endereços de entrega
            </Link>
          </li>
          <li>
            <Link className="text-slate-900 underline" to="/roteiros/montar">
              Montar roteiro diário
            </Link>
          </li>
        </ul>
      </Card>

      <Card title="Correção de registros (C5)">
        <ul className="flex flex-col gap-2 text-sm text-slate-700">
          <li>
            <Link className="text-slate-900 underline" to="/correcoes">
              Corrigir horário de chegada/saída
            </Link>
          </li>
          <li>
            <Link className="text-slate-900 underline" to="/auditoria">
              Consultar trilha de auditoria
            </Link>
          </li>
        </ul>
      </Card>

      <Card title="Equipe e base de pontos (C2)">
        <ul className="flex flex-col gap-2 text-sm text-slate-700">
          <li>
            <Link className="text-slate-900 underline" to="/entregadores">
              Cadastrar e listar Entregadores
            </Link>
          </li>
          <li>
            <Link className="text-slate-900 underline" to="/pontos">
              Cadastrar e listar Pontos
            </Link>
          </li>
        </ul>
      </Card>

      {sessao?.perfil === 'SUPERVISOR_GERAL' && (
        <Card title="Configuração inicial (C1)">
          <ul className="flex flex-col gap-2 text-sm text-slate-700">
            <li>
              <Link className="text-slate-900 underline" to="/unidades">
                Cadastrar e listar Unidades
              </Link>
            </li>
            <li>
              <Link className="text-slate-900 underline" to="/supervisores">
                Cadastrar Supervisor local
              </Link>
            </li>
            <li>
              <Link className="text-slate-900 underline" to="/parametros">
                Parametrizar custos e jornada
              </Link>
            </li>
            <li>
              <Link className="text-slate-900 underline" to="/perfis">
                Gerenciar perfis de acesso
              </Link>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}
