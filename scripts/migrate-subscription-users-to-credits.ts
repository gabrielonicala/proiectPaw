/**
 * Migration script to grant 1,500 credits to existing subscription users
 * 
 * This script should be run ONCE after migrating from subscriptions to credits.
 * It grants 1,500 Ink Vials to all users who have or had a subscription.
 * 
 * Usage: npx tsx scripts/migrate-subscription-users-to-credits.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSubscriptionUsersToCredits() {
  console.log('🚀 Starting migration: Granting credits to subscription users...\n');

  try {
    // Find all users with subscription history (active, canceled, or past subscriptions)
    const subscriptionUsers = await prisma.user.findMany({
      where: {
        OR: [
          { subscriptionPlan: { not: 'free' } },
          { subscriptionStatus: { not: 'free' } },
          { subscriptionId: { not: null } }
        ]
      },
      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        credits: true
      }
    });

    console.log(`📊 Found ${subscriptionUsers.length} users with subscription history\n`);

    if (subscriptionUsers.length === 0) {
      console.log('✅ No users to migrate. Exiting.');
      return;
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of subscriptionUsers) {
      try {
        // Grant 1,500 credits
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: {
              increment: 1500
            }
          },
          select: {
            credits: true
          }
        });

        console.log(`✅ Migrated user ${user.email || user.id}:`);
        console.log(`   Previous credits: ${user.credits}`);
        console.log(`   New credits: ${updatedUser.credits}`);
        console.log(`   Subscription: ${user.subscriptionPlan || 'N/A'} (${user.subscriptionStatus || 'N/A'})\n`);

        migrated++;
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email || user.id}:`, error);
        errors++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migrated} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users`);
    console.log(`   ❌ Errors: ${errors} users`);
    console.log(`   📊 Total processed: ${subscriptionUsers.length} users\n`);

    if (errors > 0) {
      console.log('⚠️  Some users failed to migrate. Please review the errors above.');
    } else {
      console.log('✅ Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateSubscriptionUsersToCredits()
  .then(() => {
    console.log('\n✨ Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });





