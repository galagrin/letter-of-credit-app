import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, Currency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const createLcSchema = z.object({
    referenceNumber: z.string().optional(),
    amount: z.number().positive("Сумма должна быть положительным числом"),
    currency: z.enum(Currency),
    issueDate: z.string().datetime(),
    expiryDate: z.string().datetime(),
    isConfirmed: z.boolean().optional().default(false),

    applicantId: z.number().int(),
    beneficiaryId: z.number().int(),
    issuingBankId: z.number().int(),

    advisingBankId: z.number().int().optional().nullable(),
    confirmingBankId: z.number().int().optional().nullable(),
    nominatedBankId: z.number().int().optional().nullable(),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();

        const validation = createLcSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Неверные данные", details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const {
            amount,
            currency,
            issueDate,
            expiryDate,
            isConfirmed,
            applicantId,
            beneficiaryId,
            issuingBankId,
            advisingBankId,
            confirmingBankId,
            nominatedBankId,
            referenceNumber,
        } = validation.data;

        const newLc = await prisma.letterOfCredit.create({
            data: {
                referenceNumber,
                amount,
                currency,
                issueDate,
                expiryDate,
                isConfirmed,

                // Связываем все ID сущностей
                applicant: { connect: { id: applicantId } },
                beneficiary: { connect: { id: beneficiaryId } },
                issuingBank: { connect: { id: issuingBankId } },

                // Связываем необязательные банки, только если ID были переданы
                ...(advisingBankId && { advisingBank: { connect: { id: advisingBankId } } }),
                ...(confirmingBankId && { confirmingBank: { connect: { id: confirmingBankId } } }),
                ...(nominatedBankId && { nominatedBank: { connect: { id: nominatedBankId } } }),

                // Связываем с пользователем, который создал запись
                createdBy: { connect: { id: parseInt(session.user!.id) } },
            },
        });
        return NextResponse.json(newLc, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json(
                { error: "Аккредитив с такими уникальными полями уже существует" },
                { status: 409 }
            );
        }
        console.error(`Ошибка создания аккредитива`, error);
        return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lcs = await prisma.letterOfCredit.findMany({
        include: {
            applicant: true,
            beneficiary: true,
            issuingBank: true,
        },
    });
    return NextResponse.json(lcs);
}
