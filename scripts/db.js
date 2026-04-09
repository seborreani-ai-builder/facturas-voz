// Helper script for database operations
// Usage: node scripts/db.js query "SELECT * FROM profiles"
// Usage: node scripts/db.js migrate ./supabase/migrations/002_xxx.sql

const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.nbxzxungooapjzryetyd",
  password: process.env.SUPABASE_DB_PASSWORD || "d?SebaS1771",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const [, , command, arg] = process.argv;

  await client.connect();

  try {
    if (command === "query") {
      const res = await client.query(arg);
      console.log(JSON.stringify(res.rows, null, 2));
    } else if (command === "migrate") {
      const sql = fs.readFileSync(arg, "utf8");
      await client.query(sql);
      console.log("Migration executed successfully!");
    } else if (command === "tables") {
      const res = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
      );
      res.rows.forEach((r) => console.log(" -", r.table_name));
    } else {
      console.log("Usage:");
      console.log('  node scripts/db.js query "SELECT ..."');
      console.log("  node scripts/db.js migrate ./path/to/migration.sql");
      console.log("  node scripts/db.js tables");
    }
  } finally {
    await client.end();
  }
}

run().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
