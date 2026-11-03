const { Client } = require('pg');

const adminUrl = process.env.DATABASE_ADMIN_URL;
const appPassword = process.env.POSTGRES_APP_PASSWORD;

if (!adminUrl || !appPassword) {
  throw new Error('DATABASE_ADMIN_URL and POSTGRES_APP_PASSWORD must be set');
}

async function main() {
  const client = new Client({ connectionString: adminUrl });
  await client.connect();

  try {
    const { rows } = await client.query(
      "SELECT 1 FROM pg_roles WHERE rolname = 'kharify_app'",
    );
    const { rows: quoted } = await client.query('SELECT quote_literal($1) AS password', [
      appPassword,
    ]);
    const password = quoted[0].password;

    if (rows.length === 0) {
      await client.query(
        `CREATE ROLE kharify_app LOGIN NOSUPERUSER NOBYPASSRLS PASSWORD ${password}`,
      );
    } else {
      await client.query(
        `ALTER ROLE kharify_app LOGIN NOSUPERUSER NOBYPASSRLS PASSWORD ${password}`,
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
