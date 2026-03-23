"use client";

import { Company } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "./Modal";
import { CompanyForm } from "./CompanyForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { CompanyFormData } from "@/types/data";
import { createCompany, deleteCompany, getCompanies, updateCompany } from "@/lib/api/company";
import { Button } from "../shared/Button";

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
            <div className="my-4">
                <Button size="md" variant="new" onClick={() => setIsCreateModalOpen(true)}>
                    {" "}
                    Добавить новую компанию
                </Button>
            </div>
            <table className="w-10/12 mx-auto mt-4 border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left">Название</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">ИНН</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Страна</th>
                        <th className="border border-gray-300 px-3 py-2 text-center w-40">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {companies &&
                        companies.map((company) => (
                            <tr key={company.id}>
                                <td className="border border-gray-300 px-3 py-2 text-left">{company.name}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{company.taxId || "—"}</td>
                                <td className="border border-gray-300 px-3 py-2 text-left">{company.country}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center w-40">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            onClick={() => handleDeleteClick(company.id)}
                                            size="sm"
                                            variant="danger"
                                        >
                                            Удалить
                                        </Button>
                                        <Button size="sm" variant="new" onClick={() => openEditModal(company)}>
                                            Изменить
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
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
        </>
    );
};
