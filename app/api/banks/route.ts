import { z } from "zod";
import { createCrudHandlers } from "@/lib/crudFactory";

const bankSchema = z.object({
    name: z.string().min(3, "Название банка слишком короткое"),
    BIC: z.string().startsWith("04").min(9, { message: "BIC должен быть не менее 9 символов" }).optional(),
    SWIFT: z.string().min(8, { message: "Swift должен быть не менее 8 символов" }).optional(),
    country: z.string(),
});

const { GET, POST } = createCrudHandlers({
    model: "bank",
    schema: bankSchema,
    modelName: "Банк",
});
export { GET, POST };
