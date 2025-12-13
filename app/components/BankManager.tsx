"use client";

import { useState } from "react";
import { Bank } from "@prisma/client";
import { Modal } from "./Modal";
import { useForm } from "react-hook-form";
import { BankForm } from "./BankForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

type BankFormData = {
    name: string;
    country: string;
    BIC: string | null;
    SWIFT: string | null;
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

const getBanks = async ({ signal }: { signal: AbortSignal }): Promise<Bank[]> => {
    const res = await fetch("/api/banks", { signal });
    if (!res.ok) {
        throw new Error("Не удалось загрузить банки");
    }
    return res.json();
};

const createBank = async (data: BankFormData) => {
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
const deleteBank = async (id: number) => {
    const response = await fetch(`/api/banks/${id}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(`Ошибка при удалении банка`);
    }
};

const updateBank = async ({ id, data }: { id: number; data: BankFormData }) => {
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

export const BankManager = () => {
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const {
        data: banks,
        isError,
        isLoading,
        error,
    } = useQuery({
        queryFn: getBanks,
        queryKey: ["banks"],
    });

    const { reset } = useForm<BankFormData>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: deleteBank,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banks"] });
        },
    });

    const createMutation = useMutation({
        mutationFn: createBank,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banks"] });
            setIsCreateModalOpen(false);
        },
    });

    const editMutation = useMutation({
        mutationFn: updateBank,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["banks"],
            });
            setEditingBank(null);
        },
    });

    function openEditModal(bank: Bank) {
        setEditingBank(bank);
        reset(bank);
    }

    function handleCloseModal() {
        setEditingBank(null);
    }
    const handleUpdateBankClick = async (data: BankFormData) => {
        if (!editingBank) return;
        editMutation.mutate({ id: editingBank.id, data });
    };
    const handleDeleteClick = async (id: number) => {
        if (window.confirm("Вы уверены, что хотите удалить этот банк?")) {
            deleteMutation.mutate(id);
        }
    };
    const handleCreateBankClick = async (data: BankFormData) => {
        createMutation.mutate(data);
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }
    if (isError) {
        return <div>Ошибка: {error.message}</div>;
    }
    return (
        <>
            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => setIsCreateModalOpen(true)}> Добавить новый банк</button>
            </div>
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
                    {banks &&
                        banks.map((bank) => (
                            <tr key={bank.id}>
                                <td style={tdStyles}>{bank.name}</td>
                                <td style={tdStyles}>{bank.country}</td>
                                <td style={tdStyles}>{bank.BIC || "—"}</td>
                                <td style={tdStyles}>{bank.SWIFT || "—"}</td>
                                <td style={actionsCellStyles}>
                                    <button
                                        onClick={() => handleDeleteClick(bank.id)}
                                        style={{ color: "red", marginRight: "8px", cursor: "pointer" }}
                                    >
                                        Удалить
                                    </button>
                                    <button onClick={() => openEditModal(bank)}>Изменить</button>
                                    {editingBank && (
                                        <Modal isOpen={!!editingBank} onClose={handleCloseModal}>
                                            <BankForm
                                                bank={editingBank}
                                                onFormSubmit={handleUpdateBankClick}
                                                onCancel={() => setEditingBank(null)}
                                            />
                                        </Modal>
                                    )}
                                    {isCreateModalOpen && (
                                        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                                            <BankForm
                                                bank={null}
                                                onFormSubmit={handleCreateBankClick}
                                                onCancel={() => setIsCreateModalOpen(false)}
                                            />
                                        </Modal>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </>
    );
};
