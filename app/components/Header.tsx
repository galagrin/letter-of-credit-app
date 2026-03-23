"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../shared/Button";

export const Header = () => {
    const { data: session, status } = useSession();

    return (
        <header className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
                LC-App
            </Link>
            <div>
                {status === "loading" && <p className="text-sm text-gray-500">Загрузка...</p>}

                {status === "authenticated" && (
                    <div className="flex items-center gap-4">
                        <p className="text-sm">
                            Привет, <span className="font-medium">{session.user?.name || session.user?.email}</span>!
                        </p>
                        <Button variant="danger" size="sm" onClick={() => signOut()}>
                            Выйти
                        </Button>
                    </div>
                )}

                {status === "unauthenticated" && (
                    <Button size="sm" onClick={() => signIn()}>
                        Войти
                    </Button>
                )}
            </div>
        </header>
    );
};
