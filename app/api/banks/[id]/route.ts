import { createCrudHandlers } from "@/lib/crudFactory";
import { z } from "zod";

const bankUpdateSchema = z.object({
    name: z.string().min(3, "Название банка слишком короткое"),
    BIC: z.string().startsWith("04").min(9, { message: "BIC должен быть не менее 9 символов" }).optional(),
    SWIFT: z.string().min(8, { message: "Swift должен быть не менее 8 символов" }).optional(),
    country: z.string(),
});

const { PUT, DELETE } = createCrudHandlers({
    model: "bank",
    schema: bankUpdateSchema,
    modelName: "Банк",
});

export { PUT, DELETE };
