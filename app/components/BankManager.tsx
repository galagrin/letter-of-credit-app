"use client";

import { useState } from "react";
import { Bank } from "@prisma/client";
import { Modal } from "./Modal";
import { useForm } from "react-hook-form";

type BankFormData = {
    name: string;
    country: string;
    BIC: string | null;
    SWIFT: string | null;
};
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
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const { register, handleSubmit, formState, reset } = useForm<BankFormData>();

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
    function handleEditBank(bank: Bank) {
        setEditingBank(bank);
        reset(bank);
    }

    function handleCloseModal() {
        setEditingBank(null);
    }

    async function onSubmit(data: BankFormData) {
        console.log(data);
        if (!editingBank) return;
        const response = await fetch(`/api/banks/${editingBank.id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            alert("Ошибка при редактировании банка");
            return;
        } else {
            const updatedBank = await response.json();
            setBanks(banks.map((bank) => (bank.id === updatedBank.id ? updatedBank : bank)));
            handleCloseModal();
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
                            <button onClick={() => handleEditBank(bank)}>Изменить</button>
                            {editingBank && (
                                <Modal isOpen={!!editingBank} onClose={handleCloseModal}>
                                    <h2>Редактирование банка: {editingBank.name}</h2>
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="form-field">
                                            <label className="form-label">Название</label>
                                            <input
                                                className="form-input"
                                                {...register("name", { required: true, minLength: 3 })}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">Страна</label>
                                            <input
                                                className="form-input"
                                                {...register("country", { required: true, minLength: 3 })}
                                            />
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
                                </Modal>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
