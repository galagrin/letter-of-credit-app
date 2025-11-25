"use client";
import { Session } from "next-auth"; // <-- ВОТ ОН!
import { LetterOfCredit, Company, Bank } from "@prisma/client";

type LcWithIncludes = LetterOfCredit & {
    applicant: Company;
    beneficiary: Company;
    issuingBank: Bank;
};
interface LcManagerProps {
    initialLcs: LcWithIncludes[];
    session: Session;
}

export const LcManager = ({ initialLcs, session }: LcManagerProps) => {
    return <div>LcManager</div>;
};
