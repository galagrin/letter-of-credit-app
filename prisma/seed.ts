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
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { passwordHash: hashedPassword, role: "ADMIN" },
        create: {
            email: adminEmail,
            name: "Admin User",
            passwordHash: hashedPassword,
            role: "ADMIN",
        },
    });
    console.log(`Created/found admin user: ${admin.email}`);

    const companyName = "ООО ABC";
    console.log(`Upserting company: ${companyName}...`);
    const company = await prisma.company.upsert({
        where: { name: companyName },
        update: { taxId: "1234567890" },
        create: {
            name: companyName,
            taxId: "1234567890",
        },
    });

    console.log(`Created/found company: ${company.name}`);
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
