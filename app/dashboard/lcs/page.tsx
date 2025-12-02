import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LcManager } from "@/app/components/LcManager";

export async function generateMetadata() {
    return {
        title: "Управление аккредитивами",
    };
}

export default async function LcsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/dashboard");
    }

    const lettersOfCreditFromDb = await prisma.letterOfCredit.findMany({
        orderBy: { issueDate: "asc" },
        include: {
            applicant: true,
            beneficiary: true,
            issuingBank: true,
            advisingBank: true,
            createdBy: true,
        },
    });

    const banks = await prisma.bank.findMany();
    const companies = await prisma.company.findMany();

    const formattedLcs = lettersOfCreditFromDb.map((lc) => ({
        ...lc,
        // Превращаем Decimal в строку с 2 знаками после запятой
        amount: lc.amount.toFixed(2),
        // Превращаем Date в локализованную строку даты
        issueDate: lc.issueDate.toLocaleDateString("ru-RU"),
        expiryDate: lc.expiryDate.toLocaleDateString("ru-RU"),
        // Оставляем только нужные поля из связанных объектов
        applicantName: lc.applicant.name,
        beneficiaryName: lc.beneficiary.name,
        issuingBankName: lc.issuingBank.name,
        advisingBankName: lc.advisingBank ? lc.advisingBank.name : null,
        createdBy: lc.createdById,
    }));

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <h1>Управление аккредитивами</h1>
            <LcManager initialLcs={formattedLcs} session={session} banks={banks} companies={companies} />
        </div>
    );
}
