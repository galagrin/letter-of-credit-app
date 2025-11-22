import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BankManager } from "@/app/components/BankManager";

export async function generateMetadata() {
    return {
        title: "Управление банками",
    };
}
export default async function BanksPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const banks = await prisma.bank.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <h1>Управление банками</h1>
            <BankManager initialBanks={banks} />
        </div>
    );
}
