import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
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
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1>Основная панель</h1>
            <p>Вы вошли как: {session.user?.name}</p>
            <p>Ваша роль: {session.user?.role}</p>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    maxWidth: "300px",
                    alignItems: "center",
                }}
            >
                <h2 style={{ fontSize: "1.5rem", paddingBottom: "0.5rem", paddingTop: "0.5rem" }}>Навигация</h2>

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
