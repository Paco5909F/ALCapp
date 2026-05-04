import crypto from 'crypto';

const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "tu_password"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

console.log(`${salt}:${hash}`);
