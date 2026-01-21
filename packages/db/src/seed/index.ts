import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema/index.js';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/launch_tracker';

async function seed() {
  console.log('Starting database seed...');

  const sql = postgres(connectionString);
  const db = drizzle(sql, { schema });

  try {
    // Create a default admin user
    const passwordHash = await bcrypt.hash('admin123', 10);

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'admin@launchtracker.local'),
    });

    if (!existingUser) {
      await db.insert(schema.users).values({
        email: 'admin@launchtracker.local',
        passwordHash,
        name: 'Admin User',
        role: 'admin',
      });
      console.log('Created default admin user: admin@launchtracker.local / admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
