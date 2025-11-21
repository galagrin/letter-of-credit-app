"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const Header = () => {
    const { data: session, status } = useSession();

    return (
        <header
            style={{
                padding: "1rem",
                borderBottom: "1px solid #ccc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <Link href="/">
                <span>LC-App</span>
            </Link>
            <div>
                {status === "loading" && <p>Загрузка...</p>}

                {status === "authenticated" && (
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <p>Привет, {session.user?.name || session.user?.email}!</p>
                        <button style={{ cursor: "pointer" }} onClick={() => signOut()}>
                            Выйти
                        </button>
                    </div>
                )}

                {status === "unauthenticated" && (
                    <button style={{ cursor: "pointer" }} onClick={() => signIn()}>
                        Войти
                    </button>
                )}
            </div>
        </header>
    );
};
