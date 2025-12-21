import { BankFormData } from "@/types/data";
import { Bank } from "@prisma/client";

export const getBanks = async ({ signal }: { signal: AbortSignal }): Promise<Bank[]> => {
    const res = await fetch("/api/banks", { signal });
    if (!res.ok) {
        throw new Error("Не удалось загрузить банки");
    }
    return res.json();
};

export const createBank = async (data: BankFormData) => {
    const response = await fetch(`/api/banks`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("Ошибка при создании банка");
    }
    return response.json();
};
export const deleteBank = async (id: number) => {
    const response = await fetch(`/api/banks/${id}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(`Ошибка при удалении банка`);
    }
};

export const updateBank = async ({ id, data }: { id: number; data: BankFormData }) => {
    const response = await fetch(`/api/banks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error("Ошибка при редактировании банка");
    }
    return response.json();
};
