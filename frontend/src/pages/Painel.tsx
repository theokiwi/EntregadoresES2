import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/ui';

/**
 * Página inicial provisória da Fase 1/2. A tela inicial definitiva por perfil (roteiro do
 * dia para Entregador, dashboard para Supervisor — UC00, passo 5) chega nas fases C4/C6.
 */
export function Painel() {
  const { sessao } = useAuth();

  return (
    <div className="flex flex-col gap-4">
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
