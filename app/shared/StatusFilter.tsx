"use client";

import { Button } from "./Button";

export type StatusFilter = "ALL" | "DRAFT" | "PENDING_APPROVAL" | "ISSUED" | "REJECTED";

type StatusFilterProps = {
    value: StatusFilter;
    onChange: (status: StatusFilter) => void;
};
export const StatusFilter = ({ value, onChange }: StatusFilterProps) => {
    return (
        <>
            <div className="flex gap-1">
                {[
                    { value: "ALL", label: "Все" },
                    { value: "DRAFT", label: "Черновики" },
                    { value: "PENDING_APPROVAL", label: "На проверке" },
                    { value: "ISSUED", label: "Выпущенные" },
                    { value: "REJECTED", label: "Отклонённые" },
                ].map((item) => (
                    <Button
                        key={item.value}
                        size="sm"
                        variant="filter"
                        isActive={value === item.value}
                        onClick={() => onChange(item.value as StatusFilter)}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>
        </>
    );
};
