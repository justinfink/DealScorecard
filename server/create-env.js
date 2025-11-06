// Helper script to create .env file
// Run: node create-env.js

import { writeFileSync } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Torchlight Supabase Setup\n');
console.log('Please provide your Supabase credentials:\n');

rl.question('Supabase URL (e.g., https://xxxxx.supabase.co): ', (url) => {
  rl.question('Supabase Anon Key: ', (key) => {
    const envContent = `PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=${url.trim()}
SUPABASE_ANON_KEY=${key.trim()}
`;

    try {
      writeFileSync('.env', envContent);
      console.log('\n✅ .env file created successfully!');
      console.log('\nNext steps:');
      console.log('1. Run the SQL from server/setup-supabase.sql in Supabase SQL Editor');
      console.log('2. Start the server: npm run dev');
    } catch (error) {
      console.error('Error creating .env file:', error);
    }
    
    rl.close();
  });
});
