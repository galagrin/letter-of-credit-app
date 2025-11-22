import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

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

                <Link
                    href="/dashboard/lcs"
                    style={{
                        padding: "0.75rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        textAlign: "center",
                        width: "100%",
                    }}
                >
                    Управление Аккредитивами
                </Link>

                {session.user?.role === "ADMIN" && (
                    <>
                        <Link
                            href="/dashboard/banks"
                            style={{
                                padding: "0.75rem",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                textAlign: "center",
                                width: "100%",
                            }}
                        >
                            Управление Банками
                        </Link>
                        <Link
                            href="/dashboard/companies"
                            style={{
                                padding: "0.75rem",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                textAlign: "center",
                                width: "100%",
                            }}
                        >
                            Управление Компаниями
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
