// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma"; //экземпляр клиента Prisma
// import { Prisma } from "@prisma/client"; //пространство имен типов из библиотеки Prisma
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";

// const companySchema = z.object({
//     name: z.string().min(3, "Название компании слишком короткое"),
//     taxId: z.string().min(10, { message: "ИНН должен содержать не менее 10 символов" }).optional(),
//     country: z.string(),
// });

// export async function POST(request: Request) {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== "ADMIN") {
//         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const body = await request.json();
//     const validation = companySchema.safeParse(body);

//     if (!validation.success) {
//         return NextResponse.json({ error: "Неверные данные", details: validation.error.flatten() }, { status: 400 });
//     }

//     try {
//         const newCompany = await prisma.company.create({ data: validation.data });
//         return NextResponse.json(newCompany, { status: 201 });
//     } catch (error) {
//         if (error instanceof Prisma.PrismaClientKnownRequestError) {
//             if (error.code === "P2002") {
//                 return NextResponse.json({ error: "Компания с таким именем уже существует" }, { status: 409 });
//             }
//         }
//         return NextResponse.json({ error: "Произошла ошибка на сервере" }, { status: 500 });
//     }
// }

// export async function GET() {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const companies = await prisma.company.findMany();
//     return NextResponse.json(companies);
// }

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
