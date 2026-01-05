import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './index.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
async function migrate() {
  console.log('🔄 Starting database migration...');

  try {
    // Check database connection
    const health = await db.healthCheck();
    if (health.status !== 'healthy') {
      throw new Error(`Database unhealthy: ${health.error}`);
    }
    console.log('✅ Database connection verified');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Executing schema...');
    await db.query(schema);
    console.log('✅ Schema created successfully');

    // Optionally run seed data
    if (process.env.RUN_SEED === 'true' || process.argv.includes('--seed')) {
      console.log('🌱 Seeding database...');
      const seedPath = path.join(__dirname, 'seed.sql');
      const seed = fs.readFileSync(seedPath, 'utf8');
      await db.query(seed);
      console.log('✅ Seed data inserted successfully');
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await db.close();
    process.exit(0);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export default migrate;
