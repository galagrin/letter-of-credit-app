-- CreateEnum
CREATE TYPE "LcStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ISSUED', 'REJECTED');

-- AlterTable
ALTER TABLE "LetterOfCredit" ADD COLUMN     "approvedById" INTEGER,
ADD COLUMN     "status" "LcStatus" NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
