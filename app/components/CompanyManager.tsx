"use client";

import { Company } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "./Modal";
import { CompanyForm } from "./CompanyForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

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

const getCompanies = async (): Promise<Company[]> => {
    const result = await fetch("/api/companies");
    if (result.ok) {
        return result.json();
    } else {
        throw new Error("Ошибка при загрузке компаний");
    }
};
const createCompany = async (data: CompanyFormData) => {
    const response = await fetch(`/api/companies`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("Ошибка при создании компаний");
    }
    return response.json();
};

const updateCompany = async ({ id, data }: { id: number; data: CompanyFormData }) => {
    const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error("Ошибка при редактировании компаний");
    }

    return response.json();
};

const deleteCompany = async (id: number) => {
    const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Ошибка при удалении компаний");
    }
};

export const CompanyManager = () => {
    const {
        data: companies,
        isError,
        isLoading,
        error,
    } = useQuery({
        queryFn: getCompanies,
        queryKey: ["companies"],
    });
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

    const createMutation = useMutation({
        mutationFn: createCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            setIsCreateModalOpen(false);
        },
    });
    const editMutation = useMutation({
        mutationFn: updateCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            setEditingCompany(null);
        },
    });
    const deleteMutation = useMutation({
        mutationFn: deleteCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
        },
    });

    const handleDeleteClick = async (id: number) => {
        if (window.confirm("Вы уверены, что хотите удалить эту компанию?")) {
            deleteMutation.mutate(id);
        }
    };
    const handleEditCompanyClick = async (data: CompanyFormData) => {
        if (!editingCompany) return;
        editMutation.mutate({ id: editingCompany.id, data });
    };

    const handleCreateCompanyClick = async (data: CompanyFormData) => {
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
                    {companies &&
                        companies.map((company) => (
                            <tr key={company.id}>
                                <td style={tdStyles}>{company.name}</td>
                                <td style={tdStyles}>{company.taxId || "—"}</td>
                                <td style={tdStyles}>{company.country}</td>
                                <td style={actionsCellStyles}>
                                    <button
                                        onClick={() => handleDeleteClick(company.id)}
                                        style={{ color: "red", marginRight: "8px", cursor: "pointer" }}
                                    >
                                        Удалить
                                    </button>
                                    <button onClick={() => openEditModal(company)}>Изменить</button>
                                    {editingCompany && (
                                        <Modal isOpen={!!editingCompany} onClose={handleCloseModal}>
                                            <CompanyForm
                                                company={editingCompany}
                                                onFormSubmit={handleEditCompanyClick}
                                                onCancel={() => setEditingCompany(null)}
                                            />
                                        </Modal>
                                    )}
                                    {isCreateModalOpen && (
                                        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                                            <CompanyForm
                                                company={null}
                                                onFormSubmit={handleCreateCompanyClick}
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
