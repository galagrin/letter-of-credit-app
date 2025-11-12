import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error("Please provide SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env file");
    }

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: "Admin User",
            passwordHash: bcrypt.hashSync(adminPassword, 10),
            //role: Role.ADMIN,
        },
    });

    console.log(`Created/found admin user: ${admin.email}`);
    console.log("Seeding finished.");
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
