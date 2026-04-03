import { FormattedLc, FormValues } from "@/types/data";

export const getLcs = async ({ signal }: { signal: AbortSignal }) => {
    const result = await fetch("/api/lcs", { signal });
    if (!result.ok) {
        throw new Error("Ошибка загрузки аккредитивов");
    } else {
        return result.json();
    }
};

export const deleteLc = async (id: string) => {
    const response = await fetch(`/api/lcs/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Ошибка при удалении аккредитива`);
    }
};

export const updateLc = async ({ id, formData }: { id: string; formData: FormValues }) => {
    const dataToSend = {
        referenceNumber: formData.referenceNumber,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        // Превращаем '2025-11-17' обратно в полную ISO-строку
        issueDate: new Date(formData.issueDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        isConfirmed: formData.isConfirmed,
        applicantId: formData.applicantId,
        beneficiaryId: formData.beneficiaryId,
        issuingBankId: formData.issuingBankId,
        advisingBankId: formData.advisingBankId,
    };

    const response = await fetch(`/api/lcs/${id}`, {
        method: "PUT",
        body: JSON.stringify(dataToSend),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Ошибка изменения аккредитива");

    // 2. Получаем "сырой" ответ от сервера
    const updatedLcFromDb = await response.json();

    const formattedUpdatedLc: FormattedLc = {
        ...updatedLcFromDb,
        amount: parseFloat(updatedLcFromDb.amount).toFixed(2),
        issueDate: new Date(updatedLcFromDb.issueDate).toLocaleDateString("ru-RU"),
        expiryDate: new Date(updatedLcFromDb.expiryDate).toLocaleDateString("ru-RU"),
        // Добавляем недостающие имена, которые сервер не вернул
        applicantName: updatedLcFromDb.applicant.name,

        beneficiaryName: updatedLcFromDb.beneficiary.name,
        issuingBankName: updatedLcFromDb.issuingBank.name,
        advisingBankName: updatedLcFromDb.advisingBank ? updatedLcFromDb.advisingBank.name : null,
    };
    return formattedUpdatedLc;
};

export const createLc = async (formData: FormValues) => {
    const dataToSend = {
        referenceNumber: formData.referenceNumber,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        // Превращаем '2025-11-17' обратно в полную ISO-строку
        issueDate: new Date(formData.issueDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        isConfirmed: formData.isConfirmed,
        applicantId: formData.applicantId,
        beneficiaryId: formData.beneficiaryId,
        issuingBankId: formData.issuingBankId,
        advisingBankId: formData.advisingBankId,
    };
    const response = await fetch(`/api/lcs`, {
        method: "POST",
        body: JSON.stringify(dataToSend),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Ошибка создания аккредитива");

    const newLcFromDb = await response.json();
    const formattedNewLc: FormattedLc = {
        ...newLcFromDb,
        amount: parseFloat(newLcFromDb.amount).toFixed(2),
        issueDate: new Date(newLcFromDb.issueDate).toLocaleDateString("ru-RU"),
        expiryDate: new Date(newLcFromDb.expiryDate).toLocaleDateString("ru-RU"),
        applicantName: newLcFromDb.applicant.name,
        beneficiaryName: newLcFromDb.beneficiary.name,
        issuingBankName: newLcFromDb.issuingBank.name,
        advisingBankName: newLcFromDb.advisingBank ? newLcFromDb.advisingBank.name : null,
    };
    return formattedNewLc;
};

export const sendLcToApproval = async (id: string) => {
    const dataToSend = {
        id: id,
        status: "PENDING_APPROVAL",
    };
    const response = await fetch(`/api/lcs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(dataToSend),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error(`Ошибка при изменении статуса аккредитива`);
    }
};
export const changeStatusToIssued = async (id: string) => {
    const dataToSend = {
        id: id,
        status: "ISSUED",
    };
    const response = await fetch(`/api/lcs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(dataToSend),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error(`Ошибка при изменении статуса аккредитива`);
    }
};
export const changeStatusToRegected = async (id: string) => {
    const dataToSend = {
        id: id,
        status: "REJECTED",
    };
    const response = await fetch(`/api/lcs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(dataToSend),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error(`Ошибка при изменении статуса аккредитива`);
    }
};
