"use client";

import { Bank } from "@prisma/client";
import { useForm } from "react-hook-form";

type BankFormData = Omit<Bank, "id">;
type BankEditProps = {
    bank: Bank;
    onFormSubmit: (data: BankFormData) => Promise<void>;
};

export const BankEditForm = ({ bank, onFormSubmit }: BankEditProps) => {
    const { register, handleSubmit, formState } = useForm<BankFormData>({ defaultValues: bank });

    return (
        <>
            <h2>Редактирование банка: {bank.name}</h2>
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
                    Submit
                </button>
            </form>
        </>
    );
};
