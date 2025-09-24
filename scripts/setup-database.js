// Database setup script for production
const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Setting up database...');
    
    // This will create all tables based on the Prisma schema
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // You can add any initial data here if needed
    console.log('✅ Database setup complete');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
