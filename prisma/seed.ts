import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Hash password admin
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Upsert admin user (create if not exists, update if exists)
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      name: "System Administrator",
      department: "Operations",
      position: "Manager",
    },
    create: {
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
      name: "System Administrator",
      department: "Operations",
      position: "Manager",
    },
  });

  console.log("✅ Admin user created/updated:");
  console.log(`   Username : admin`);
  console.log(`   Password : admin123`);
  console.log(`   Role     : ADMIN`);
  console.log(`   ID       : ${admin.id}`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
