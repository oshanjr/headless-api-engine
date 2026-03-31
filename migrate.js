const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  try {
    // 1. Manually parse .env.local so we don't have to install the 'dotenv' package
    const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
    const dbUrlMatch = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
    
    if (!dbUrlMatch) {
      throw new Error('Could not parse DATABASE_URL from .env.local');
    }
    
    const dbUrl = dbUrlMatch[1];
    console.log('Attempting connection to:', dbUrl.replace(/:[^:@]*@/, ':*****@'));

    // 2. Connect directly to Postgres
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    
    // 3. Read and execute the SQL file
    const sqlStr = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('Applying schema.sql...');
    await client.query(sqlStr);
    
    console.log('\u2705 Success: All tables have been created and the schema seeded!');
    await client.end();
    
  } catch (error) {
    console.error('\u274C Database Seeding Failed:');
    console.error(error.message);
    if(error.message.includes('password authentication failed')) {
      console.log('\n\u2192 FIX: Please ensure you updated `.env.local` to use your actual Windows PostgreSQL password instead of "password".');
    } else if (error.message.includes('database "delivery_platform" does not exist')) {
        console.log('\n\u2192 FIX: The database does not exist. Please open pgAdmin and create an empty database named "delivery_platform" first.');
    }
  }
}

seedDatabase();
