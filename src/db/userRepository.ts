import * as Crypto from 'expo-crypto';
import { getDb } from '@/db/database';
import type { KnowledgeLevel, User } from '@/types';
import { isKnowledgeLevel } from '@/utils/guards';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  level: string;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    level: isKnowledgeLevel(row.level) ? row.level : 'basico',
  };
}

async function hash(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export async function createUser(name: string, email: string, password: string, level: KnowledgeLevel): Promise<User> {
  const db = await getDb();
  const normalized = email.trim().toLowerCase();
  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM users WHERE email = ?', [normalized]);
  if (existing !== null) throw new Error('Este e-mail já está cadastrado.');
  const salt = Crypto.randomUUID();
  const passwordHash = await hash(password, salt);
  const result = await db.runAsync(
    'INSERT INTO users (name, email, password_hash, salt, level, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [name.trim(), normalized, passwordHash, salt, level, new Date().toISOString()],
  );
  return { id: result.lastInsertRowId, name: name.trim(), email: normalized, level };
}

export async function authenticate(email: string, password: string): Promise<User> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (row === null) throw new Error('E-mail ou senha incorretos.');
  const attempt = await hash(password, row.salt);
  if (attempt !== row.password_hash) throw new Error('E-mail ou senha incorretos.');
  return toUser(row);
}

export async function getUserById(id: number): Promise<User | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  return row === null ? null : toUser(row);
}

export async function updateUserLevel(id: number, level: KnowledgeLevel): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE users SET level = ? WHERE id = ?', [level, id]);
}

export async function getKv(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [key]);
  return row === null ? null : row.value;
}

export async function setKv(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
}

export async function deleteKv(key: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM kv WHERE key = ?', [key]);
}
