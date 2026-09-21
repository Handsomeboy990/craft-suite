// Generates the VAPID pair that push notifications need.
//
//   npm run push-keys
//
// The public key reaches the browser. The private key stays on the server, in
// the environment, and never in the repository.
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log('Add these to the server environment, not to a file in the repository:\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('VAPID_SUBJECT=mailto:you@example.com');
