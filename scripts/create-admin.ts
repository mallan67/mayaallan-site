import { db } from '../src/db';
import { adminUsers } from '../src/db/schema';
import { hashPassword } from '../src/lib/auth';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  console.log('🔐 Create Admin User');
  console.log('===================\n');

  const email = await question('Enter admin email: ');
  const password = await question('Enter admin password: ');

  if (!email || !password) {
    console.error('❌ Email and password are required');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }

  try {
    const passwordHash = await hashPassword(password);

    const result = await db.insert(adminUsers).values({
      email,
      passwordHash,
    }).returning();

    console.log('\n✅ Admin user created successfully!');
    console.log(`Email: ${result[0].email}`);
    console.log(`ID: ${result[0].id}`);
    console.log(`\nYou can now login at: /admin/login`);

  } catch (error: any) {
    if (error?.code === '23505') {
      console.error('❌ An admin user with this email already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
