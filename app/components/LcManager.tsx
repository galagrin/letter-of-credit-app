"use client";
import { Session } from "next-auth";
import { useState } from "react";
import { Modal } from "./Modal";
import { LcForm } from "./LcForm";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormattedLc, FormValues } from "@/types/data";
import { getBanks } from "@/lib/api/bank";
import { getCompanies } from "@/lib/api/company";
import { createLc, deleteLc, getLcs, updateLc } from "@/lib/api/lc";
import { queryClient } from "@/lib/query-client";
import { Bank, Company, LetterOfCredit } from "@prisma/client";

// Описывает "сырой" объект, который приходит от API (`getLcs`)
export type RawLc = LetterOfCredit & {
    applicant: Company;
    beneficiary: Company;
    issuingBank: Bank;
    advisingBank: Bank | null;
};
interface LcManagerProps {
    session: Session;
}
export const LcManager = ({ session }: LcManagerProps) => {
    const {
        data: lcs = [],
        isError,
        error,
        isLoading,
    } = useQuery({
        queryFn: getLcs,
        queryKey: ["lcs"],
        select: (rawLcs: RawLc[]) => {
            return rawLcs.map((lc) => ({
                ...lc,
                amount: parseFloat(lc.amount.toString()).toFixed(2), // преобразование в строку
                issueDate: new Date(lc.issueDate).toLocaleDateString("ru-RU"),
                expiryDate: new Date(lc.expiryDate).toLocaleDateString("ru-RU"),
                applicantName: lc.applicant.name,
                beneficiaryName: lc.beneficiary.name,
                issuingBankName: lc.issuingBank.name,
                advisingBankName: lc.advisingBank ? lc.advisingBank.name : null,
            }));
        },
    });
    const { data: banks = [] } = useQuery({
        queryKey: ["banks"],
        queryFn: getBanks,
    });
    const { data: companies = [] } = useQuery({
        queryKey: ["companies"],
        queryFn: getCompanies,
    });

    const [editingLc, setEditingLc] = useState<FormattedLc | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { reset } = useForm<FormattedLc>();

    const deleteMutation = useMutation({
        mutationFn: deleteLc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
    });

    const handleDeleteClick = (id: string) => {
        if (window.confirm("Вы уверены, что хотите удалить этот аккредитив?")) {
            deleteMutation.mutate(id);
        }
    };

    const handlaCloseModal = () => {
        setEditingLc(null);
        setIsCreateModalOpen(false);
    };

    const updateMutation = useMutation({
        mutationFn: updateLc,
        onSuccess: (updatedLc) => {
            // Оптимистичное обновление UI без повторного fetch!
            queryClient.setQueryData(["lcs"], (oldData: FormattedLc[] | undefined) => {
                return oldData ? oldData.map((lc) => (lc.id === updatedLc.id ? updatedLc : lc)) : [];
            });
        },
    });

    const handleUpdateSubmit = async (formData: FormValues) => {
        if (!editingLc) return;
        updateMutation.mutate({ id: editingLc.id, formData });
    };
    const openEditModal = (lc: FormattedLc) => {
        setEditingLc(lc);
        reset(lc);
    };
    const openCreateModal = () => setIsCreateModalOpen(true);

    const createMutation = useMutation({
        mutationFn: createLc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
    });

    const handleCreateLcClick = async (data: FormValues) => {
        createMutation.mutate(data);
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }
    if (isError) {
        return <div>Ошибка: {error.message}</div>;
    }

    const getInitialDataForForm = (lc: FormattedLc): FormValues => {
        // преобразование дат в формат '2025-11-17'
        const parseRuDateToInput = (dateString: string) => {
            if (!dateString || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
                return new Date().toISOString().split("T")[0];
            }
            const parts = dateString.split(".");
            // [2] -> год, [1] -> месяц, [0] -> день
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        };

        return {
            referenceNumber: lc.referenceNumber || "",
            amount: lc.amount,
            currency: lc.currency,
            issueDate: parseRuDateToInput(lc.issueDate),
            expiryDate: parseRuDateToInput(lc.expiryDate),
            isConfirmed: lc.isConfirmed,
            applicantId: lc.applicantId,
            beneficiaryId: lc.beneficiaryId,
            issuingBankId: lc.issuingBankId,
            advisingBankId: lc.advisingBankId,
        };
    };

    return (
        <>
            <div style={{ marginBottom: "1rem" }}>
                <button onClick={openCreateModal}>+ Добавить аккредитив</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Номер аккредитива</th>
                        <th>Сумма</th>
                        <th>Валюта</th>
                        <th>Дата выпуска</th>
                        <th>Дата истечения</th>
                        <th>подтвержденный</th>
                        <th>Аппликант</th>
                        <th>Бенефициар</th>
                        <th>Банк эмитент</th>
                        <th>Банк авизующий</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {lcs.map((lc: FormattedLc) => {
                        const isOwner = lc.createdById === parseInt(session.user.id);
                        const isAdmin = session.user.role === "ADMIN";
                        const canEditOrDelete = isOwner || isAdmin;

                        return (
                            <tr key={lc.id}>
                                <td>{lc.referenceNumber}</td>
                                <td>{lc.amount}</td>
                                <td>{lc.currency}</td>
                                <td>{lc.issueDate}</td>
                                <td>{lc.expiryDate}</td>
                                <td>{lc.isConfirmed ? "Да" : "Нет"}</td>
                                <td>{lc.applicantName}</td>
                                <td>{lc.beneficiaryName}</td>
                                <td>{lc.issuingBankName}</td>
                                <td>{lc.advisingBankName || "—"}</td>
                                <td>
                                    {canEditOrDelete ? (
                                        <>
                                            <button
                                                onClick={() => handleDeleteClick(lc.id)}
                                                style={{ color: "red", marginRight: "8px", cursor: "pointer" }}
                                            >
                                                Удалить
                                            </button>
                                            <button onClick={() => openEditModal(lc)}>Изменить</button>
                                        </>
                                    ) : (
                                        <p>Нет прав на изменение/удаление</p>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {editingLc && (
                <Modal isOpen={!!editingLc} onClose={handlaCloseModal}>
                    <LcForm
                        initialData={getInitialDataForForm(editingLc)}
                        onFormSubmit={handleUpdateSubmit}
                        onCancel={handlaCloseModal}
                        banks={banks}
                        companies={companies}
                    />
                </Modal>
            )}
            {isCreateModalOpen && (
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                    <LcForm
                        onFormSubmit={handleCreateLcClick}
                        onCancel={handlaCloseModal}
                        banks={banks}
                        companies={companies}
                    />
                </Modal>
            )}
        </>
    );
};
