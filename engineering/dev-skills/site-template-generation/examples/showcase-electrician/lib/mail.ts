import nodemailer from 'nodemailer';

// Mail is optional, and everything that uses it works without it: a message
// still lands in the inbox, and the password can still be set on the server.
// What mail adds is the client not needing anyone else.

export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_URL && process.env.MAIL_FROM);
}

export async function send(to: string, subject: string, text: string): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    const transport = nodemailer.createTransport(process.env.SMTP_URL!);
    await transport.sendMail({ from: process.env.MAIL_FROM!, to, subject, text });
    return true;
  } catch (error) {
    // A failed send never fails the thing it was announcing, and is never
    // silent either.
    console.error('mail send failed', { subject, error });
    return false;
  }
}
