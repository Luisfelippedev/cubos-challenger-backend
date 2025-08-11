import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null = null;
  private readonly fromEmail: string;

  constructor() {
    const from = process.env.EMAIL_FROM ?? 'no-reply@example.com';
    this.fromEmail = from;

    const host = process.env.SMTP_HOST ?? '127.0.0.1';
    const port = Number(process.env.SMTP_PORT ?? 1025);

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: undefined,
      });
      this.transporter = transporter;
      this.logger.log(`SMTP configurado em ${host}:${port}`);
    } catch (err) {
      this.logger.error('Falha ao configurar transporte SMTP', err as Error);
    }
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    if (!this.transporter || !this.fromEmail) {
      this.logger.warn('SMTP não configurado corretamente. Ignorando envio.');
      return;
    }

    try {
      const result = await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text:
          options.text ??
          (options.html
            ? options.html
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
            : options.subject),
      });

      const messageId = result?.messageId ?? 'sem-id';
      this.logger.log(`E-mail enviado com sucesso. id=${messageId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      this.logger.error(`Erro inesperado ao enviar e-mail: ${msg}`);
      throw err;
    }
  }
}
