import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const registerUserSchema = z.object({
    email: z.string().email({ message: "Неверный формат email" }),
    password: z.string().min(8, { message: "Пароль должен быть не менее 8 символов" }),
    name: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validation = registerUserSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Неверные данные", details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password, name } = validation.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
            },
        });

        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Ошибка при создании пользователя:", error);
        return NextResponse.json({ error: "Произошла внутренняя ошибка сервера" }, { status: 500 });
    }
}
