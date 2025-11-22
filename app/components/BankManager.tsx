"use client";

import { useState } from "react";
import { Bank } from "@prisma/client";

type BankManagerProps = {
    initialBanks: Bank[];
};

// Стили для таблицы (todo: вынести в CSS)
const tableStyles = {
    width: "90%",
    borderCollapse: "collapse" as const, // 'as const'  для TypeScript
    margin: "0 auto",
    marginTop: "1rem",
};
const thStyles = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left" as const,
    backgroundColor: "#f2f2f2",
};
const tdStyles = {
    border: "1px solid #ddd",
    padding: "8px",
};
const actionsCellStyles = {
    ...tdStyles,
    width: "150px",
    textAlign: "center" as const,
};
export const BankManager = ({ initialBanks }: BankManagerProps) => {
    const [banks, setBanks] = useState(initialBanks);

    async function handleDelete(id: number) {
        if (!window.confirm("Вы уверены, что хотите удалить этот банк?")) {
            return;
        }

        const response = await fetch(`/api/banks/${id}`, { method: "DELETE" });
        if (!response.ok) {
            alert("Ошибка при удалении банка");
            return;
        } else {
            setBanks((prevBanks) => {
                return prevBanks.filter((bank) => bank.id !== id);
            });
        }
    }
    return (
        <table style={tableStyles}>
            <thead>
                <tr>
                    <th style={thStyles}>Название</th>
                    <th style={thStyles}>Страна</th>
                    <th style={thStyles}>БИК</th>
                    <th style={thStyles}>SWIFT</th>
                    <th style={thStyles}>Действия</th>
                </tr>
            </thead>
            <tbody>
                {banks.map((bank) => (
                    <tr key={bank.id}>
                        <td style={tdStyles}>{bank.name}</td>
                        <td style={tdStyles}>{bank.country}</td>
                        <td style={tdStyles}>{bank.BIC || "—"}</td>
                        <td style={tdStyles}>{bank.SWIFT || "—"}</td>
                        <td style={actionsCellStyles}>
                            <button
                                onClick={() => handleDelete(bank.id)}
                                style={{ color: "red", marginRight: "8px", cursor: "pointer" }}
                            >
                                Удалить
                            </button>
                            <button>Изменить</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
