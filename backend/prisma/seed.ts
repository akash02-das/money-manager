import { PrismaClient, CategoryType, Currency } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Money Manager database seed...');

  const demoEmail = 'demo@moneymanager.local';
  const existing = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existing) {
    console.log('ℹ️ Demo user already exists:', demoEmail);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('DemoPassword123!', salt);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Akash Das',
      email: demoEmail,
      passwordHash,
      currency: Currency.BDT,
      location: 'Dhaka, Bangladesh',
      monthlySavingsTarget: 25000,
      categories: {
        create: [
          { name: 'Salary & Employment', type: CategoryType.INCOME, icon: 'Briefcase', color: '#10b981', isDefault: true },
          { name: 'Software Consulting', type: CategoryType.INCOME, icon: 'Laptop', color: '#06b6d4', isDefault: true },
          { name: 'Housing & Rent', type: CategoryType.EXPENSE, icon: 'Home', color: '#6366f1', isDefault: true },
          { name: 'Groceries & Market', type: CategoryType.EXPENSE, icon: 'ShoppingBag', color: '#f59e0b', isDefault: true },
          { name: 'Utilities & Internet', type: CategoryType.EXPENSE, icon: 'Zap', color: '#ec4899', isDefault: true },
          { name: 'Dining & Cafes', type: CategoryType.EXPENSE, icon: 'UtensilsCrossed', color: '#f97316', isDefault: true },
          { name: 'Transportation', type: CategoryType.EXPENSE, icon: 'Car', color: '#8b5cf6', isDefault: true },
          { name: 'Health & Wellness', type: CategoryType.EXPENSE, icon: 'Activity', color: '#14b8a6', isDefault: true },
        ],
      },
    },
  });

  console.log('✅ Seed completed! Created demo account:', demoUser.email);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

