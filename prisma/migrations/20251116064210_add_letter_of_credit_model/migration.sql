-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('RUB', 'USD', 'EUR', 'CNY', 'INR');

-- CreateTable
CREATE TABLE "LetterOfCredit" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'RUB',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "applicantId" INTEGER NOT NULL,
    "beneficiaryId" INTEGER NOT NULL,
    "issuingBankId" INTEGER NOT NULL,
    "advisingBankId" INTEGER,
    "confirmingBankId" INTEGER,
    "nominatedBankId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterOfCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LetterOfCredit_referenceNumber_key" ON "LetterOfCredit"("referenceNumber");

-- CreateIndex
CREATE INDEX "LetterOfCredit_applicantId_idx" ON "LetterOfCredit"("applicantId");

-- CreateIndex
CREATE INDEX "LetterOfCredit_beneficiaryId_idx" ON "LetterOfCredit"("beneficiaryId");

-- CreateIndex
CREATE INDEX "LetterOfCredit_issuingBankId_idx" ON "LetterOfCredit"("issuingBankId");

-- CreateIndex
CREATE INDEX "LetterOfCredit_createdById_idx" ON "LetterOfCredit"("createdById");

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_issuingBankId_fkey" FOREIGN KEY ("issuingBankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_advisingBankId_fkey" FOREIGN KEY ("advisingBankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_confirmingBankId_fkey" FOREIGN KEY ("confirmingBankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_nominatedBankId_fkey" FOREIGN KEY ("nominatedBankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
