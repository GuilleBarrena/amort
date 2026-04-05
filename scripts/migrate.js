#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      create table if not exists public._migrations (
        id         serial primary key,
        name       text unique not null,
        applied_at timestamptz default now()
      )
    `);

    // Get already-applied migrations
    const { rows } = await client.query('select name from public._migrations');
    const applied = new Set(rows.map((r) => r.name));

    // Read and sort migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      console.log(`apply ${file}`);
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into public._migrations (name) values ($1)', [file]);
        await client.query('commit');
      } catch (err) {
        await client.query('rollback');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }

    console.log('Migrations complete.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
