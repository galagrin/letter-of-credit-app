"use client";
interface TableHeadProps {
    data: string[];
}

export const TableHead = ({ data }: TableHeadProps) => {
    return (
        <thead>
            <tr className="bg-gray-100">
                {data.map((item, index) => {
                    const isLastItem = index === data.length - 1;
                    return (
                        <th
                            key={index}
                            className={
                                !isLastItem
                                    ? "border border-gray-300 px-3 py-2 text-left"
                                    : "border border-gray-300 px-3 py-2 text-center w-40"
                            }
                        >
                            {item}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};
