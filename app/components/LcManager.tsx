"use client";
import { Session } from "next-auth";
import { useState } from "react";

type FormattedLc = {
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

    return (
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
                                            onClick={() => {}}
                                            style={{ color: "red", marginRight: "8px", cursor: "pointer" }}
                                        >
                                            Удалить
                                        </button>
                                        <button onClick={() => {}}>Изменить</button>
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
    );
};
