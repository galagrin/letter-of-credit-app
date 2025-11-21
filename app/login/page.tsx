"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            redirect: false, //  не перенаправляем автоматически
            email,
            password,
        });

        if (result?.ok) {
            router.push("/dashboard");
        } else {
            setError("Неверный email или пароль. Попробуйте снова.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
            <h1>Вход в систему</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label className="form-label" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-field">
                    <label className="form-label" htmlFor="password">
                        Пароль
                    </label>
                    <input
                        id="password"
                        className="form-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" style={{ width: "100%", padding: "0.75rem", cursor: "pointer" }}>
                    Войти
                </button>
            </form>
        </div>
    );
}
