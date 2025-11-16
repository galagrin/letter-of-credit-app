import { z } from "zod";
import { createCrudHandlers } from "@/lib/crudFactory";

const companySchema = z.object({
    name: z.string().min(3, "Название компании слишком короткое"),
    taxId: z.string().min(10, { message: "ИНН должен содержать не менее 10 символов" }).optional(),
    country: z.string(),
});

const { GET, POST } = createCrudHandlers({
    model: "company",
    schema: companySchema,
    modelName: "Компания",
});
export { GET, POST };
