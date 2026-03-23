import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardNavLink } from "../shared/DashboardNavLink";

// Компонент ДОЛЖЕН быть async
export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // Защита роута
    if (!session) {
        redirect("/login"); // Используем redirect из next/navigation
    }

    // Если сессия есть, показываем контент
    return (
        <div className="flex flex-col items-center p-8">
            <h1 className="text-2xl font-semibold mb-2">Основная панель</h1>
            <p className="text-sm text-gray-700">
                Вы вошли как: <span className="font-medium">{session.user?.name}</span>
            </p>
            <p className="text-sm text-gray-700 mb-4">
                Ваша роль: <span className="font-medium">{session.user?.role}</span>
            </p>

            <div className="mt-4 flex w-full max-w-xs flex-col items-center gap-4">
                <h2 className="text-lg font-medium py-2">Навигация</h2>

                <DashboardNavLink href={"/dashboard/lcs"} children="Управление Аккредитивами" />

                {session.user?.role === "ADMIN" && (
                    <>
                        <DashboardNavLink href={"/dashboard/banks"} children="Управление Банками" />
                        <DashboardNavLink href={"/dashboard/companies"} children="Управление Компаниями" />
                    </>
                )}
            </div>
        </div>
    );
}
