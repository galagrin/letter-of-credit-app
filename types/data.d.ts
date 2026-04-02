// Тип для данных, которые собирает форма для Компании
export type CompanyFormData = Omit<Company, "id">;

// Тип для данных, которые собирает форма для Банка
export type BankFormData = {
    name: string;
    country: string;
    BIC: string | null;
    SWIFT: string | null;
};

//  тип для отображения аккредитива в таблице
export type FormattedLc = {
    id: string;
    referenceNumber: string | null;
    amount: string;
    currency: string;
    issueDate: string;
    expiryDate: string;
    isConfirmed: boolean;
    // передаем только имена, а не целые объекты
    applicantName: string;
    applicantId: number;
    beneficiaryName: string;
    beneficiaryId: number;
    issuingBankName: string;
    issuingBankId: number;
    advisingBankName: string | null;
    advisingBankId: number | null;
    createdById: number;
    status: string;
};

// Тип для данных, которые собирает форма для Аккредитива
export type FormValues = {
    referenceNumber: string;
    amount: string;
    currency: string;
    issueDate: string;
    expiryDate: string;
    isConfirmed: boolean;
    applicantId: number;
    beneficiaryId: number;
    issuingBankId: number;
    advisingBankId: number | null;
    status: string;
};
