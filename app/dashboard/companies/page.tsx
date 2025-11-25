import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompanyManager } from "@/app/components/CompanyManager";

export async function generateMetadata() {
    return {
        title: "Управление компаниями",
    };
}

export default async function CompaniesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const companies = await prisma.company.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <h1>Управление компаниями</h1>
            <CompanyManager initialCompanies={companies} />
        </div>
    );
}
