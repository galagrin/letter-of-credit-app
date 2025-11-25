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

    const lettersOfCredit = await prisma.letterOfCredit.findMany({
        orderBy: { issueDate: "asc" },
        include: {
            applicant: true,
            beneficiary: true,
            issuingBank: true,
        },
    });

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <h1>Управление аккредитивами</h1>
            <LcManager initialLcs={lettersOfCredit} session={session} />
        </div>
    );
}
