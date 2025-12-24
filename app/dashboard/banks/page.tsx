import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
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

    return (
        <div className="flex flex-col items-center p-8">
            <h1 className="text-2xl font-semibold mb-2">Управление банками</h1>
            <BankManager />
        </div>
    );
}
