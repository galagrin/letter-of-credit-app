import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const updateStatusSchema = z.object({
    status: z.enum(["DRAFT", "PENDING_APPROVAL", "ISSUED", "REJECTED"]),
});
type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteParams) {
    const { id } = await ctx.params;
    //1.  Проверка сессии
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    try {
        // 2. Валиддация полученного тела запроса
        const body = await request.json();
        const validation = updateStatusSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Неверный статус", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { status: newStatus } = validation.data;
        // 3. Поиск аккредитива
        const lcToUpdate = await prisma.letterOfCredit.findUnique({
            where: { id },
            select: {
                status: true,
                createdById: true,
            },
        });
        if (!lcToUpdate) {
            return NextResponse.json({ error: "Аккредитив не найден" }, { status: 404 });
        }

        if (userRole === "ADMIN") {
            if (lcToUpdate.status !== "PENDING_APPROVAL") {
                return NextResponse.json(
                    { error: "Админ может обрабатывать только со статусом 'На проверке'" },
                    { status: 400 }
                );
            }
            if (newStatus === "PENDING_APPROVAL") {
                return NextResponse.json(
                    {
                        error: "Аккредитив уже отправлен на проверку",
                    },
                    { status: 400 }
                );
            }

            const allowedStatuses = ["DRAFT", "ISSUED", "REJECTED"];
            if (!allowedStatuses.includes(newStatus)) {
                return NextResponse.json({ error: "Неверный статус" }, { status: 400 });
            }
        } else {
            if (lcToUpdate.createdById !== userId) {
                return NextResponse.json(
                    { error: "ТОлько создатель может отправить аккердитив на проверку" },
                    { status: 403 }
                );
            }
            //  Проверка статуса - драфт
            if (lcToUpdate.status !== "DRAFT") {
                return NextResponse.json({ error: "Нельзя отправить на проверку, неверный статус" }, { status: 400 });
            }
            if (newStatus !== "PENDING_APPROVAL") {
                return NextResponse.json(
                    { error: "Разрешено отправлять только на проверку из черновика" },
                    { status: 400 }
                );
            }
        }

        const updatedLC = await prisma.letterOfCredit.update({
            where: { id },
            data: { status: newStatus },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
        return NextResponse.json(updatedLC, { status: 200 });
    } catch (error) {
        console.error(`Ошибка смены статуса LC:`, error);
        return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
    }
}
