import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client"; //пространство имен типов из библиотеки Prisma
import { prisma } from "@/lib/prisma"; //экземпляр клиента Prisma
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const bankSchema = z.object({
    name: z.string().min(3, "Название банка слишком короткое"),
    BIC: z.string().startsWith("04").min(9, { message: "BIC должен быть не менее 9 символов" }).optional(),
    SWIFT: z.string().min(8, { message: "Swift должен быть не менее 8 символов" }).optional(),
    country: z.string(),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = bankSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: "Неверные данные", details: validation.error.flatten() }, { status: 400 });
    }

    try {
        const newBank = await prisma.bank.create({ data: validation.data });
        return NextResponse.json(newBank, { status: 201 });
    } catch (error) {
        // Prisma при нарушении unique-ограничения выдает ошибку с кодом P2002
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json({ error: "Бнк с таким именем уже существует" }, { status: 409 });
            }
        }
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banks = await prisma.bank.findMany();
    return NextResponse.json(banks);
}
