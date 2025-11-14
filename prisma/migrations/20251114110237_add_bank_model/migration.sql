-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "BIC" TEXT,
    "SWIFT" TEXT,
    "country" TEXT NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_name_key" ON "Bank"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_BIC_key" ON "Bank"("BIC");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_SWIFT_key" ON "Bank"("SWIFT");
