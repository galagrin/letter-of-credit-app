"use client";
import { Session } from "next-auth";
import { useState } from "react";
import { Modal } from "./Modal";
import { LcForm, FormValues } from "./LcForm";

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
    beneficiaryName: string;
    issuingBankName: string;
    advisingBankName: string | null;
    createdById: number;
};

interface LcManagerProps {
    initialLcs: FormattedLc[];
    session: Session;
}

export const LcManager = ({ initialLcs, session }: LcManagerProps) => {
    const [lcs, setLcs] = useState<FormattedLc[]>(initialLcs);
    const [editingLc, setEditingLc] = useState<FormattedLc | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleDeleteLc = async (id: string) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот аккредитив?")) {
            return;
        }
        try {
            const response = await fetch(`/api/lcs/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setLcs((prevLcs) => prevLcs.filter((lc) => lc.id !== id));
                console.log("Аккредитив успешно удален");
            } else {
                const errorData = await response.json();
                console.error("Ошибка удаления аккредитива:", errorData);
            }
        } catch (error) {
            console.error("Ошибка при удалении аккредитива", error);
        }
    };
    const handlaCloseModal = () => {
        setEditingLc(null);
        setIsCreateModalOpen(false);
    };

    const handleUpdateLc = async (formData: FormValues) => {
        if (!editingLc) return;

        // Преобразуем данные из формы в то, что нужно для API
        const dataToSend = {
            referenceNumber: formData.referenceNumber,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            // Превращаем '2025-11-17' обратно в полную ISO-строку
            issueDate: new Date(formData.issueDate).toISOString(),
            expiryDate: new Date(formData.expiryDate).toISOString(),
            isConfirmed: formData.isConfirmed,
            // Заглушки для ID
            applicantId: 1,
            beneficiaryId: 2,
            issuingBankId: 1,
        };

        try {
            const response = await fetch(`/api/lcs/${editingLc.id}`, {
                method: "PUT",
                body: JSON.stringify(dataToSend),
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const updatedLcFromDb = await response.json();

                // Преобразование ответа от сервера
                const formattedUpdatedLc: FormattedLc = {
                    ...updatedLcFromDb,
                    amount: parseFloat(updatedLcFromDb.amount).toFixed(2),
                    issueDate: new Date(updatedLcFromDb.issueDate).toLocaleDateString("ru-RU"),
                    expiryDate: new Date(updatedLcFromDb.expiryDate).toLocaleDateString("ru-RU"),
                    // Добавляем недостающие имена, которые сервер не вернул
                    applicantName: editingLc!.applicantName, // Берем из редактируемого объекта
                    beneficiaryName: editingLc!.beneficiaryName,
                    issuingBankName: editingLc!.issuingBankName,
                    advisingBankName: editingLc!.advisingBankName,
                };

                setLcs(lcs.map((lc) => (lc.id === formattedUpdatedLc.id ? formattedUpdatedLc : lc)));
                handlaCloseModal();
            } else {
                const errorData = await response.json();
                console.error("Ошибка изменения аккредитива:", errorData);
            }
        } catch (error) {
            console.error("Ошибка при изменении аккредитива", error);
        }
    };

    const openEditModal = (lc: FormattedLc) => {
        setEditingLc(lc);
    };
    const openCreateModal = () => setIsCreateModalOpen(true);

    const handleCreateLc = async (formData: FormValues) => {
        const dataToSend = {
            referenceNumber: formData.referenceNumber,
            amount: formData.amount,
            currency: formData.currency,
            // Превращаем '2025-11-17' обратно в полную ISO-строку
            issueDate: new Date(formData.issueDate).toISOString(),
            expiryDate: new Date(formData.expiryDate).toISOString(),
            isConfirmed: formData.isConfirmed,
            // Заглушки для ID
            applicantId: 1,
            beneficiaryId: 2,
            issuingBankId: 1,
        };
        try {
            const response = await fetch(`/api/lcs`, {
                method: "POST",
                body: JSON.stringify(dataToSend),
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                const newLc = await response.json();
                setLcs([...lcs, newLc]);
                setIsCreateModalOpen(false);
            } else {
                const errorData = await response.json();
                console.error("Ошибка создания аккредитива:", errorData);
            }
        } catch (error) {
            console.error("Ошибка при создании аккредитива", error);
        }
    };

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
                    {lcs.map((lc) => {
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
                                                onClick={() => handleDeleteLc(lc.id)}
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
                        onFormSubmit={handleUpdateLc}
                        onCancel={handlaCloseModal}
                    />
                </Modal>
            )}
            {isCreateModalOpen && (
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                    <LcForm onFormSubmit={handleCreateLc} onCancel={handlaCloseModal} />
                </Modal>
            )}
        </>
    );
};
