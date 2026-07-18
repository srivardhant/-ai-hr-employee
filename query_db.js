const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Integrations:', await prisma.googleIntegration.findMany());
  console.log('Interviews:', await prisma.interview.findMany());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
