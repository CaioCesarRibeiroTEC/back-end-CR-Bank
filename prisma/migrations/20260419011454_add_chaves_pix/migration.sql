/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_conta_destino_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_conta_origem_id_fkey";

-- DropTable
DROP TABLE "accounts";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "numero_conta" TEXT NOT NULL,
    "saldo" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "user_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChavePix" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conta_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChavePix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_numero_conta_key" ON "Account"("numero_conta");

-- CreateIndex
CREATE UNIQUE INDEX "ChavePix_chave_key" ON "ChavePix"("chave");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChavePix" ADD CONSTRAINT "ChavePix_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_conta_origem_id_fkey" FOREIGN KEY ("conta_origem_id") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_conta_destino_id_fkey" FOREIGN KEY ("conta_destino_id") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
