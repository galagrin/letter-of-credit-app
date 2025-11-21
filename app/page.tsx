import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}>
            <h1>Добро пожаловать в LC-App!</h1>
            {session ? (
                <div>
                    <h2>Вы вошли как: {session.user?.name || session.user?.email}</h2>
                    <p>Ваша роль: {session.user?.role}</p>
                    <Link href="/dashboard" style={{ color: "blue", marginTop: "1rem", display: "inline-block" }}>
                        Перейти на основную панель
                    </Link>
                </div>
            ) : (
                <div>
                    <h2>Вы не авторизованы.</h2>
                    <p>Пожалуйста, войдите в систему, чтобы получить доступ к приложению.</p>
                    <Link
                        href="/api/auth/signin"
                        style={{ color: "blue", marginTop: "1rem", display: "inline-block", cursor: "pointer" }}
                    >
                        Перейти к странице входа
                    </Link>
                </div>
            )}
        </div>
    );
}
