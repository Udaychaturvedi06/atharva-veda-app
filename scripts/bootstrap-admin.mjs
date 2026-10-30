#!/usr/bin/env node

/**
 * Secure Administrator Bootstrap CLI Tool
 * Atharva Veda App — Administrative Consecration
 *
 * Usage:
 *   ADMIN_USERNAME=myadmin ADMIN_PASSWORD=my_secure_password node scripts/bootstrap-admin.mjs
 *   node scripts/bootstrap-admin.mjs --username=myadmin --password=my_secure_password
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersPath = path.join(__dirname, '..', 'users.json');

// Parse CLI flags or Environment Variables
const args = process.argv.slice(2);
let username = process.env.ADMIN_USERNAME || '';
let password = process.env.ADMIN_PASSWORD || '';

for (const arg of args) {
  if (arg.startsWith('--username=')) {
    username = arg.split('=')[1];
  } else if (arg.startsWith('--password=')) {
    password = arg.split('=')[1];
  }
}

if (!username || !password) {
  console.error('\n❌ Error: Missing credentials.');
  console.error('Usage:');
  console.error('  ADMIN_USERNAME=<user> ADMIN_PASSWORD=<pass> node scripts/bootstrap-admin.mjs');
  console.error('  or: node scripts/bootstrap-admin.mjs --username=<user> --password=<pass>\n');
  process.exit(1);
}

const normalizedUsername = username.toLowerCase().trim();

if (normalizedUsername.length < 3 || !/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
  console.error('❌ Error: Username must be at least 3 alphanumeric characters/underscores.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Error: Administrative password must be at least 8 characters in length.');
  process.exit(1);
}

// Load existing database
let usersDb = {};
if (fs.existsSync(usersPath)) {
  try {
    usersDb = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (err) {
    console.error('❌ Error reading existing users.json:', err.message);
    process.exit(1);
  }
}

const passwordHash = bcrypt.hashSync(password, 12);

usersDb[normalizedUsername] = {
  username: username.trim(),
  passwordHash,
  role: 'admin',
  updatedAt: new Date().toISOString()
};

const tempPath = `${usersPath}.tmp`;
fs.writeFileSync(tempPath, JSON.stringify(usersDb, null, 2), 'utf8');
fs.renameSync(tempPath, usersPath);

console.log(`\n✅ Administrator account "${username.trim()}" successfully created/updated.`);
console.log('Role: admin | Cost factor: 12');
console.log('File:', usersPath);
console.log('Remember to keep your administrative password secure.\n');
