import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Currency, Prisma } from "@prisma/client";

const updateLcSchema = z.object({
    referenceNumber: z.string().optional(),
    amount: z.number().positive("Сумма должна быть положительным числом").optional(),
    currency: z.enum(Currency).optional(),
    issueDate: z.iso.datetime().optional(),
    expiryDate: z.iso.datetime().optional(),
    isConfirmed: z.boolean().default(false).optional(),

    applicantId: z.number().int().optional(),
    beneficiaryId: z.number().int().optional(),
    issuingBankId: z.number().int().optional(),

    advisingBankId: z.number().int().optional().nullable(),
    confirmingBankId: z.number().int().optional().nullable(),
    nominatedBankId: z.number().int().optional().nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: RouteParams) {
    const { id } = await ctx.params;
    //1.  Проверка сессии
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Поиск аккредитива
    const lcToUpdate = await prisma.letterOfCredit.findUnique({ where: { id } });

    if (!lcToUpdate) {
        return NextResponse.json({ error: "Not fount" }, { status: 404 });
    }

    // 3. Проверка прав доступа
    const isOwner = lcToUpdate.createdById === parseInt(session.user.id);
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Валидация тела запроса
    const body = await request.json();
    const validation = updateLcSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ error: "Неверные данные", details: validation.error.flatten() }, { status: 400 });
    }

    // 5. Подготовка данных для Prisma
    const {
        applicantId,
        beneficiaryId,
        issuingBankId,
        advisingBankId,
        confirmingBankId,
        nominatedBankId,
        ...restOfData
    } = validation.data;

    const dataToUpdate: Prisma.LetterOfCreditUpdateInput = {
        ...restOfData,
        // Преобразуем ID в формат, понятный Prisma
        ...(applicantId && { applicant: { connect: { id: applicantId } } }),
        ...(beneficiaryId && { beneficiary: { connect: { id: beneficiaryId } } }),
        ...(issuingBankId && { issuingBank: { connect: { id: issuingBankId } } }),
        ...(advisingBankId && { advisingBank: { connect: { id: advisingBankId } } }),
        ...(confirmingBankId && { confirmingBank: { connect: { id: confirmingBankId } } }),
        ...(nominatedBankId && { nominatedBank: { connect: { id: nominatedBankId } } }),
    };

    // 6. Обновление записи
    try {
        const updatedLc = await prisma.letterOfCredit.update({
            where: { id },
            data: dataToUpdate,
        });
        return NextResponse.json(updatedLc, { status: 200 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return NextResponse.json(
                { error: "Одна из связанных сущностей (банк, компания) не найдена" },
                { status: 404 }
            );
        }
        console.error(`Ошибка обновления аккредитива`, error);
        return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
    }
}

export async function DELETE(request: Request, ctx: RouteParams) {
    const { id } = await ctx.params;
    //1.  Проверка сессии
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 2. Поиск аккредитива
    const lcToDelete = await prisma.letterOfCredit.findUnique({ where: { id } });
    if (!lcToDelete) {
        return NextResponse.json({ error: "Not fount" }, { status: 404 });
    }

    // 3. Проверка прав доступа
    const isOwner = lcToDelete.createdById === parseInt(session.user.id);
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await prisma.letterOfCredit.delete({
            where: { id },
        });
        return new NextResponse(null, { status: 204 }); // 204 No Content
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return NextResponse.json({ error: `Аккредитив с ${id} не найден` }, { status: 404 });
        }
        console.error(`Ошибка удаления аккредитива`, error);
        return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
    }
}
