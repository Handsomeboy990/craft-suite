import { writeJson } from '@/lib/store';
import { FILES } from '@/lib/paths';
import { record } from '@/lib/audit';
import { getContent } from '@/lib/content';
import { mailConfigured, send } from '@/lib/mail';
import { callerAddress, consume, reset as clearLimit } from '@/lib/rate-limit';
import { MINIMUM_PASSWORD_LENGTH } from '@/lib/auth';
import { clearToken, hashPassword, issueToken, tokenValid } from '@/lib/reset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Asking for a link. The answer never changes, whether mail is configured, the
// address is reachable or the request is the tenth in a minute: a client
// reading it learns nothing an attacker could not, and the limit is what stops
// the client's own inbox filling with links they did not ask for.
const SAME_ANSWER = {
  ok: true,
  message:
    "Si une adresse de récupération est configurée, un lien vient d'y être envoyé. Il est valable trente minutes.",
};

export async function POST(request: Request) {
  const address = callerAddress(request.headers);
  const limit = consume('reset', address);
  if (!limit.allowed) return Response.json(SAME_ANSWER);

  const content = getContent();
  const recovery = content.contact.email;

  if (mailConfigured() && recovery) {
    const token = issueToken();
    const link = `${content.site.baseUrl.replace(/\/$/, '')}/admin/reset?token=${token}`;
    const sent = await send(
      recovery,
      `Réinitialisation du mot de passe de ${content.site.name}`,
      [
        `Une réinitialisation du mot de passe de l'administration de ${content.site.name} a été demandée.`,
        '',
        `Pour choisir un nouveau mot de passe, ouvrez ce lien dans les trente minutes :`,
        link,
        '',
        "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : le mot de passe actuel reste valable.",
      ].join('\n'),
    );
    record('password-reset-requested', address, sent ? 'mail sent' : 'mail failed');
  } else {
    record('password-reset-requested', address, 'mail not configured');
  }

  return Response.json(SAME_ANSWER);
}

// Using the link.
export async function PUT(request: Request) {
  const address = callerAddress(request.headers);
  const limit = consume('reset', address);
  if (!limit.allowed) {
    return Response.json(
      { ok: false, error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429 },
    );
  }

  let token = '';
  let password = '';
  try {
    const payload = (await request.json()) as { token?: unknown; password?: unknown };
    token = typeof payload.token === 'string' ? payload.token : '';
    password = typeof payload.password === 'string' ? payload.password : '';
  } catch {
    return Response.json({ ok: false, error: 'requête invalide' }, { status: 400 });
  }

  if (!tokenValid(token)) {
    record('password-reset-refused', address);
    return Response.json(
      { ok: false, error: 'Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.' },
      { status: 401 },
    );
  }
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    return Response.json(
      { ok: false, error: `Le mot de passe doit faire au moins ${MINIMUM_PASSWORD_LENGTH} caractères.` },
      { status: 422 },
    );
  }

  writeJson(FILES.admin, await hashPassword(password));
  // Every session dies with the password, including one an intruder may hold.
  writeJson(FILES.sessions, {});
  clearToken();
  // The point of the link is to get back in. Leaving the login locked because
  // of the attempts that lost the password would make it useless.
  clearLimit('login', address);
  record('password-reset', address);

  return Response.json({ ok: true });
}
