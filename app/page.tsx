import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="text-center">
            <h1 className="text-2xl font-semibold mb-6">Добро пожаловать в LC-App!</h1>
            {session ? (
                <div className="space-y-2">
                    <h2 className="text-lg font-medium">
                        Вы вошли как: <span className="font-semibold">{session.user?.name || session.user?.email}</span>
                    </h2>
                    <p className="text-sm text-gray-600">
                        Ваша роль: <span className="font-semibold">{session.user?.role}</span>
                    </p>
                    <Link
                        href="/dashboard"
                        className="mt-4 inline-block text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        Перейти на основную панель
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    <h2 className="text-lg font-medium">Вы не авторизованы.</h2>
                    <p className="text-sm text-gray-600">
                        Пожалуйста, войдите в систему, чтобы получить доступ к приложению.
                    </p>
                    <Link
                        href="/api/auth/signin"
                        className="mt-4 inline-block text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                        Перейти к странице входа
                    </Link>
                </div>
            )}
        </div>
    );
}
