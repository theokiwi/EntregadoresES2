import { Injectable, Logger } from '@nestjs/common';

export interface ConviteEnviado {
  destinatario: string;
  token: string;
}

/**
 * Stub de envio de e-mail (UC02, passo 5). Nenhum provedor SMTP está definido em
 * arquitetura.md para o MVP — aqui só logamos o convite. `ultimoConviteEnviado` existe só
 * para os testes e2e conseguirem "receber" o link sem um servidor de e-mail de verdade.
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private ultimoConviteEnviado?: ConviteEnviado;

  async enviarConvite(destinatario: string, token: string): Promise<void> {
    this.ultimoConviteEnviado = { destinatario, token };
    this.logger.log(
      `Convite para ${destinatario}: /definir-senha?token=${token}`,
    );
  }

  getUltimoConviteEnviado(): ConviteEnviado | undefined {
    return this.ultimoConviteEnviado;
  }
}
