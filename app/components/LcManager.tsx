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
import { Button } from "../shared/Button";

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
            // Оптимистичное обновление UI без повторного fetch
            queryClient.setQueryData(["lcs"], (oldData: FormattedLc[] | undefined) => {
                return oldData ? oldData.map((lc) => (lc.id === updatedLc.id ? updatedLc : lc)) : [];
            });
            setEditingLc(null);
        },
        onError: (error) => {
            console.error("Ошибка обновления:", error);
            // TODO показать уведомление пользователю
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
            setIsCreateModalOpen(false);
        },
        onError: (error) => {
            console.error("Ошибка создания:", error);
            // TODO показать уведомление пользователю
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
            status: lc.status,
        };
    };

    return (
        <>
            <div className="my-4">
                <Button size="md" variant="new" onClick={openCreateModal}>
                    Добавить аккредитив
                </Button>
            </div>
            <table className="w-10/12 mx-auto mt-4 border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left">Сумма</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Номер аккредитива</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Валюта</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Дата выпуска</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Дата истечения</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">подтвержденный</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Аппликант</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Бенефициар</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Банк эмитент</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Банк авизующий</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Статус</th>
                        <th className="border border-gray-300 px-3 py-2 text-center w-40">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {lcs.map((lc: FormattedLc) => {
                        const isOwner = lc.createdById === parseInt(session.user.id);
                        const isAdmin = session.user.role === "ADMIN";
                        const canEditOrDelete = isOwner || isAdmin;
                        //пока для тестов, потом убрать (isAdmin && lc.status === "ISSUED")
                        const hasRightToDeletion =
                            (isAdmin && lc.status === "ISSUED") || (isOwner && lc.status === "DRAFT");

                        return (
                            <tr key={lc.id}>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.referenceNumber}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.amount}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.currency}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.issueDate}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.expiryDate}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">
                                    {lc.isConfirmed ? "Да" : "Нет"}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.applicantName}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.beneficiaryName}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.issuingBankName}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">
                                    {lc.advisingBankName || "—"}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{lc.status}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center w-40">
                                    {canEditOrDelete ? (
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="flex gap-2">
                                                {hasRightToDeletion && (
                                                    <Button
                                                        onClick={() => handleDeleteClick(lc.id)}
                                                        size="sm"
                                                        variant="danger"
                                                    >
                                                        Удалить
                                                    </Button>
                                                )}
                                                {lc.status !== "ISSUED" && (
                                                    <Button size="sm" variant="new" onClick={() => openEditModal(lc)}>
                                                        Изменить
                                                    </Button>
                                                )}
                                            </div>
                                            {lc.status === "DRAFT" && (
                                                <Button
                                                    size="sm"
                                                    variant="new"
                                                    onClick={() => {
                                                        /* обработчик */
                                                    }}
                                                >
                                                    На проверку
                                                </Button>
                                            )}
                                        </div>
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
