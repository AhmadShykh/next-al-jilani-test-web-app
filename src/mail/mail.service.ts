import * as nodemailer from 'nodemailer';

export class MailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: `"No Reply" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
