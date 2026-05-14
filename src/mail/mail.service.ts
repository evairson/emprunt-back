import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/** Envoi de mails via nodemailer. */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  onModuleInit() {
    /* Initialise le transporter nodemailer */
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
    if (!SMTP_HOST) {
      this.logger.warn('SMTP not configured — emails will be logged only');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    });
  }

  async send(to: string, subject: string, text: string) {
    /* Envoie un mail */
    const from = process.env.SMTP_FROM ?? 'emprunt@totally-sport.fr';
    if (!this.transporter) {
      this.logger.log(`[MAIL] to=${to} subject="${subject}"\n${text}`);
      return;
    }
    try {
      const info = (await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
      })) as { messageId?: string };
      this.logger.log(`Mail envoyé à ${to} (id=${info.messageId})`);
    } catch (e) {
      this.logger.error(
        `Échec envoi mail à ${to}`,
        e instanceof Error ? e.stack : String(e),
      );
    }
  }
}
