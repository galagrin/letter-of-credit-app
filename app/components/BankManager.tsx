"use client";

import { useState } from "react";
import { Bank } from "@prisma/client";
import { Modal } from "./Modal";
import { useForm } from "react-hook-form";
import { BankForm } from "./BankForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { createBank, deleteBank, getBanks, updateBank } from "@/lib/api/bank";
import { BankFormData } from "@/types/data";
import { Button } from "../shared/Button";

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
            <div className="my-4">
                <Button size="md" variant="new" onClick={() => setIsCreateModalOpen(true)}>
                    Добавить новый банк
                </Button>
            </div>
            <table className="w-10/12 mx-auto mt-4 border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left">Название</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Страна</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">БИК</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">SWIFT</th>
                        <th className="border border-gray-300 px-3 py-2 text-center w-40">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {banks &&
                        banks.map((bank) => (
                            <tr key={bank.id} className="odd:bg-white even:bg-gray-50">
                                <td className="border border-gray-300 px-3 py-2">{bank.name}</td>
                                <td className="border border-gray-300 px-3 py-2">{bank.country}</td>
                                <td className="border border-gray-300 px-3 py-2">{bank.BIC || "—"}</td>
                                <td className="border border-gray-300 px-3 py-2">{bank.SWIFT || "—"}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center w-40">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteClick(bank.id)}>
                                            Удалить
                                        </Button>

                                        <Button size="sm" variant="new" onClick={() => openEditModal(bank)}>
                                            Изменить
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

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
        </>
    );
};
