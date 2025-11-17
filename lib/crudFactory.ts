import { NextResponse } from "next/server";
import { z, ZodType } from "zod";
import { prisma } from "@/lib/prisma"; //экземпляр клиента Prisma
import { Prisma } from "@prisma/client"; //пространство имен типов из библиотеки Prisma
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type SupportedModel = "bank" | "company";

interface CrudOptions<T extends ZodType> {
    model: SupportedModel;
    schema: T;
    modelName: string;
}
export function createCrudHandlers<T extends ZodType>({ model, schema, modelName }: CrudOptions<T>) {
    const POST = async (request: Request) => {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Неверные данные", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        try {
            let newItem;
            switch (model) {
                case "bank":
                    newItem = await prisma.bank.create({
                        data: validation.data as z.infer<T>,
                    });
                    break;
                case "company":
                    newItem = await prisma.company.create({
                        data: validation.data as z.infer<T>,
                    });
                    break;
                default:
                    throw new Error(`Unsupported model: ${model}`);
            }

            return NextResponse.json(newItem, { status: 201 });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                return NextResponse.json(
                    { error: `${modelName} с такими уникальными полями уже существует` },
                    { status: 409 }
                );
            }
            console.error(`Error creating ${modelName}:`, error);
            return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
        }
    };

    const GET = async () => {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let items;
        switch (model) {
            case "bank":
                items = await prisma.bank.findMany();
                break;
            case "company":
                items = await prisma.company.findMany();
                break;
            default:
                throw new Error(`Unsupported model: ${model}`);
        }
        return NextResponse.json(items);
    };

    // DELETE
    const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        try {
            const id = parseInt(params.id);
            switch (model) {
                case "bank":
                    await prisma.bank.delete({
                        where: { id },
                    });
                    break;
                case "company":
                    await prisma.company.delete({
                        where: { id },
                    });
                    break;
                default:
                    throw new Error(`Unsupported model: ${model}`);
            }

            await prisma.bank.delete({
                where: { id: parseInt(params.id) },
            });
            return new NextResponse(null, { status: 204 }); // 204 No Content
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                return NextResponse.json({ error: `${modelName} с ID ${params.id} не найден` }, { status: 404 });
            }
            console.error(`Error creating ${modelName}:`, error);
            return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
        }
    };

    // PUT
    const PUT = async (request: Request, { params }: { params: { id: string } }) => {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Неверные данные", details: validation.error.flatten() },
                { status: 400 }
            );
        }
        try {
            let updatedItem;
            switch (model) {
                case "bank":
                    updatedItem = await prisma.bank.update({
                        where: { id: parseInt(params.id) },
                        data: validation.data as z.infer<T>,
                    });
                    break;
                case "company":
                    updatedItem = await prisma.company.update({
                        where: { id: parseInt(params.id) },
                        data: validation.data as z.infer<T>,
                    });
                    break;
                default:
                    throw new Error(`Unsupported model: ${model}`);
            }
            return NextResponse.json(updatedItem);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                return NextResponse.json(
                    { error: `${modelName} с такими уникальными полями уже существует` },
                    { status: 409 }
                );
            }
            console.error(`Error creating ${modelName}:`, error);
            return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
        }
    };
    return { POST, GET, DELETE, PUT };
}
