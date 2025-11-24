"use client";

import { Bank } from "@prisma/client";
import { useForm } from "react-hook-form";

type BankFormData = Omit<Bank, "id" | "createdAt" | "updatedAt">;

type BankEditProps = {
    bank?: Bank | null;
    onFormSubmit: (data: BankFormData) => Promise<void>;
    onCancel: () => void;
};

export const BankEditForm = ({ bank, onFormSubmit, onCancel }: BankEditProps) => {
    const { register, handleSubmit, formState } = useForm<BankFormData>({
        defaultValues: bank || {
            name: "",
            country: "",
            BIC: "",
            SWIFT: "",
        },
    });

    const isEditing = !!bank;
    return (
        <>
            <h2>{isEditing ? `Редактирование банка: ${bank.name}` : "Добавление банка"}</h2>
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <div className="form-field">
                    <label className="form-label">Название</label>
                    <input className="form-input" {...register("name", { required: true, minLength: 3 })} />
                </div>
                <div className="form-field">
                    <label className="form-label">Страна</label>
                    <input className="form-input" {...register("country", { required: true, minLength: 3 })} />
                </div>
                <div className="form-field">
                    <label className="form-label">BIC</label>
                    <input className="form-input" {...register("BIC")} />
                </div>
                <div className="form-field">
                    <label className="form-label">SWIFT</label>
                    <input className="form-input" {...register("SWIFT")} />
                </div>
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
