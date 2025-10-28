/* @ts-nocheck */
import { prisma } from "./auth.js";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "./utils/password.js";

async function main() {
  console.log("Seeding database...");

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Créer l'utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        username: "admin",
        email: "admin@localhost.local",
        hashed_password: hashPassword("CG0z30T@uW3!9O@u2ZHL"),
      },
    });

    console.log("✅ Admin user created:", adminUser);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
