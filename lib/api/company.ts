import { CompanyFormData } from "@/types/data";
import { Company } from "@prisma/client";

export const getCompanies = async ({ signal }: { signal: AbortSignal }): Promise<Company[]> => {
    const result = await fetch("/api/companies", { signal });
    if (result.ok) {
        return result.json();
    } else {
        throw new Error("Ошибка при загрузке компаний");
    }
};
export const createCompany = async (data: CompanyFormData) => {
    const response = await fetch(`/api/companies`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("Ошибка при создании компаний");
    }
    return response.json();
};

export const updateCompany = async ({ id, data }: { id: number; data: CompanyFormData }) => {
    const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error("Ошибка при редактировании компаний");
    }

    return response.json();
};

export const deleteCompany = async (id: number) => {
    const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Ошибка при удалении компании");
    }
};
