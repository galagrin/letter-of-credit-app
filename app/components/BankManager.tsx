"use client";

import { useState } from "react";
import { Bank } from "@prisma/client";

type BankManagerProps = {
    initialBanks: Bank[];
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
        <ul>
            {banks.map((bank) => (
                <li key={bank.id}>
                    {bank.name}
                    <button onClick={() => handleDelete(bank.id)}>Удалить</button>
                    <button>Изменить</button>
                </li>
            ))}
        </ul>
    );
};
