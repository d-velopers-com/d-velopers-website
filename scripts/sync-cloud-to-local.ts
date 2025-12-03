import { PrismaClient } from '@prisma/client';

const CLOUD_DATABASE_URL = process.env.DATABASE_URL;
const LOCAL_DATABASE_URL = "postgresql://root:root@localhost:5432/d_velopers?schema=public";

async function syncData() {
  const cloudPrisma = new PrismaClient({
    datasources: {
      db: {
        url: CLOUD_DATABASE_URL,
      },
    },
  });

  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: LOCAL_DATABASE_URL,
      },
    },
  });

  try {
    console.log('Connecting to databases...');

    // Fetch all users from cloud
    console.log('Fetching users from cloud database...');
    const users = await cloudPrisma.user.findMany();
    console.log(`Found ${users.length} users`);

    // Insert users into local database
    console.log('Inserting users into local database...');
    for (const user of users) {
      await localPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log('✓ Users synced successfully');

    // Fetch all posts from cloud (if they exist)
    console.log('Fetching posts from cloud database...');
    try {
      const posts = await cloudPrisma.post.findMany();
      console.log(`Found ${posts.length} posts`);

      if (posts.length > 0) {
        console.log('Inserting posts into local database...');
        for (const post of posts) {
          await localPrisma.post.upsert({
            where: { id: post.id },
            update: post,
            create: post,
          });
        }
        console.log('✓ Posts synced successfully');
      }
    } catch (error) {
      console.log('⚠ Posts table might not exist in cloud database, skipping...');
    }

    console.log('\n✅ Data sync completed successfully!');
  } catch (error) {
    console.error('❌ Error syncing data:', error);
    process.exit(1);
  } finally {
    await cloudPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

syncData();
