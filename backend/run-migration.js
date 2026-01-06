import 'dotenv/config';
import db from './src/db/index.js';

async function runMigration() {
  try {
    console.log('Creating invitations table...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'guest')),
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
        invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating indexes...');

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_invitations_org_status ON invitations(organization_id, status);
    `);

    console.log('Creating trigger function...');

    await db.query(`
      CREATE OR REPLACE FUNCTION update_invitations_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS trigger_invitations_updated_at ON invitations;
      CREATE TRIGGER trigger_invitations_updated_at
        BEFORE UPDATE ON invitations
        FOR EACH ROW
        EXECUTE FUNCTION update_invitations_updated_at();
    `);

    console.log('✅ Invitations table created successfully!');

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await db.close();
    process.exit(1);
  }
}

runMigration();
