// Password hashing, shared by the server and the operator scripts. scrypt is
// memory hard; the parameters are stored next to each hash so they can be
// raised later without invalidating the accounts that predate the change.
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

export const PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };
export const MINIMUM_LENGTH = 12;

function derive(password, salt, params) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, params.keylen, { N: params.N, r: params.r, p: params.p }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** @returns {Promise<{ salt: string, hash: string, params: string }>} */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await derive(password, salt, PARAMS)).toString('hex');
  return { salt, hash, params: JSON.stringify(PARAMS) };
}

// The same work is done when there is no record to compare with, so the
// answer and its timing do not say whether the account exists.
/** @returns {Promise<boolean>} */
export async function verifyPassword(password, record) {
  const params = record?.params ? JSON.parse(record.params) : PARAMS;
  const salt = record?.salt ?? 'no-such-account';
  const derived = await derive(password, salt, params);
  if (!record?.hash) return false;
  const expected = Buffer.from(record.hash, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
