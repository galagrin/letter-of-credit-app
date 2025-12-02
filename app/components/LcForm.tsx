"use client";

import { Bank, Company } from "@prisma/client";
import { useForm } from "react-hook-form";

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
};

type LcFormDataProps = {
    initialData?: Partial<FormValues>;
    onCancel: () => void;
    onFormSubmit: (data: FormValues) => Promise<void>;
    banks: Bank[];
    companies: Company[];
};

export const LcForm = ({ initialData, onCancel, onFormSubmit, banks, companies }: LcFormDataProps) => {
    const { register, handleSubmit, formState } = useForm<FormValues>({
        defaultValues: initialData,
    });

    const isEditing = !!initialData;

    return (
        <>
            <h2>
                {isEditing ? `Редактирование аккредитива: ${initialData.referenceNumber}` : "Добавление аккредитива"}
            </h2>
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <div className="form-field">
                    <label className="form-label">Номер аккредитива</label>
                    <input className="form-input" {...register("referenceNumber")} />
                </div>
                <div className="form-field">
                    <label className="form-label">Сумма</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        {...register("amount", { required: true })}
                    />
                </div>
                <div className="form-field">
                    <label className="form-label">Валюта</label>
                    <input className="form-input" {...register("currency", { required: true })} />
                </div>
                <div className="form-field">
                    <label className="form-label">Дата выпуска</label>
                    <input type="date" className="form-input" {...register("issueDate", { required: true })} />
                </div>
                <div className="form-field">
                    <label className="form-label">Дата истечения</label>
                    <input type="date" className="form-input" {...register("expiryDate", { required: true })} />
                </div>
                <div className="form-field">
                    <label className="form-label">Подтвержденный</label>
                    <input type="checkbox" className="form-input" {...register("isConfirmed")} />
                </div>

                <div className="form-field">
                    <label className="form-label">Банк-эмитент</label>
                    <select {...register("issuingBankId", { valueAsNumber: true, required: true })}>
                        {banks.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                                {bank.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* <p>Внимание: выбор компаний и банков пока не реализован.</p> */}
                <button type="submit" disabled={formState.isSubmitting}>
                    {isEditing ? "Сохранить" : "Создать"}
                </button>
                <button type="button" onClick={onCancel}>
                    Отмена
                </button>
            </form>
        </>
    );
};
