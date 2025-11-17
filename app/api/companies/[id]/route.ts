import { createCrudHandlers } from "@/lib/crudFactory";
import { z } from "zod";

const companyUpdateSchema = z.object({
    name: z.string().min(3, "Название компании слишком короткое"),
    taxId: z.string().min(10, { message: "ИНН должен содержать не менее 10 символов" }).optional(),
    country: z.string(),
});

const { PUT, DELETE } = createCrudHandlers({
    model: "company",
    schema: companyUpdateSchema,
    modelName: "Компания",
});

export { PUT, DELETE };
