import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Компонент ДОЛЖЕН быть async
export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // Защита роута
    if (!session) {
        redirect("/login"); // Используем redirect из next/navigation
    }

    // Если сессия есть, показываем контент
    return (
        <div>
            <h1>Основная панель</h1>
            <p>Вы вошли как: {session.user?.name}</p>
            <p>Ваша роль: {session.user?.role}</p>
        </div>
    );
}
