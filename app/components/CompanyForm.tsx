"use client";

import { Company } from "@prisma/client";
import { useForm } from "react-hook-form";

type CompanyFormData = Omit<Company, "id">;

interface CompanyFormProps {
    company?: Company | null;
    onFormSubmit: (data: CompanyFormData) => Promise<void>;
    onCancel: () => void;
}

export const CompanyForm = ({ company, onFormSubmit, onCancel }: CompanyFormProps) => {
    const { register, handleSubmit, formState } = useForm<CompanyFormData>({
        defaultValues: company || {
            name: "",
            country: "",
            taxId: "",
        },
    });

    const isEditing = !!company;

    return (
        <>
            <h2>{isEditing ? `Редактирование компании: ${company.name}` : "Добавление компании"}</h2>
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
                    <label className="form-label">ИНН</label>
                    <input className="form-input" {...register("taxId", { required: true, minLength: 10 })} />
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
