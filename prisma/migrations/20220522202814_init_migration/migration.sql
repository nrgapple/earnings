-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Earning" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "val" INTEGER,
    "end" TIMESTAMP(3) NOT NULL,
    "start" TIMESTAMP(3),
    "fp" TEXT NOT NULL,
    "fy" INTEGER NOT NULL,
    "companyTicker" TEXT NOT NULL,

    CONSTRAINT "Earning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

-- AddForeignKey
ALTER TABLE "Earning" ADD CONSTRAINT "Earning_companyTicker_fkey" FOREIGN KEY ("companyTicker") REFERENCES "Company"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;
