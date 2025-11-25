"use client";

import { Company } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "./Modal";
import { CompanyForm } from "./CompanyForm";

type CompanyFormData = Omit<Company, "id">;
type CompanyManagerProps = {
    initialCompanies: Company[];
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
export const CompanyManager = ({ initialCompanies }: CompanyManagerProps) => {
    const [companies, setCompanies] = useState(initialCompanies);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const { reset } = useForm<CompanyFormData>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    function openEditModal(company: Company) {
        setEditingCompany(company);
        reset(company);
    }

    function handleCloseModal() {
        setEditingCompany(null);
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Вы уверены, что хотите удалить эту компанию?")) {
            return;
        }
        const response = await fetch(`/api/companies/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            alert("Ошибка при удалении компании");
            return;
        } else {
            setCompanies((prevCompanies) => {
                return prevCompanies.filter((item) => item.id !== id);
            });
        }
    }

    async function handleEditCompany(data: CompanyFormData) {
        if (!editingCompany) return;
        const response = await fetch(`/api/companies/${editingCompany.id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            alert("Ошибка при редактировании банка");
            return;
        } else {
            const updatedCompany = await response.json();
            setCompanies(companies.map((item) => (item.id === updatedCompany.id ? updatedCompany : item)));
            handleCloseModal();
            setEditingCompany(null);
        }
    }

    async function handleCreateCompany(data: CompanyFormData) {
        const response = await fetch(`/api/companies`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Ошибка при создании: ${error.error}`);
        } else {
            const newCompany = await response.json();
            setCompanies([...companies, newCompany]);
            setIsCreateModalOpen(false);
        }
    }
    return (
        <>
            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => setIsCreateModalOpen(true)}> Добавить новую компанию</button>
            </div>
            <table style={tableStyles}>
                <thead>
                    <tr>
                        <th style={thStyles}>Название</th>
                        <th style={thStyles}>ИНН</th>
                        <th style={thStyles}>Страна</th>
                        <th style={thStyles}>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company) => (
                        <tr key={company.id}>
                            <td style={tdStyles}>{company.name}</td>
                            <td style={tdStyles}>{company.taxId || "—"}</td>
                            <td style={tdStyles}>{company.country}</td>
                            <td style={actionsCellStyles}>
                                <button
                                    onClick={() => handleDelete(company.id)}
                                    style={{ color: "red", marginRight: "8px", cursor: "pointer" }}
                                >
                                    Удалить
                                </button>
                                <button onClick={() => openEditModal(company)}>Изменить</button>
                                {editingCompany && (
                                    <Modal isOpen={!!editingCompany} onClose={handleCloseModal}>
                                        <CompanyForm
                                            company={editingCompany}
                                            onFormSubmit={handleEditCompany}
                                            onCancel={() => setEditingCompany(null)}
                                        />
                                    </Modal>
                                )}
                                {isCreateModalOpen && (
                                    <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                                        <CompanyForm
                                            company={null}
                                            onFormSubmit={handleCreateCompany}
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
