/*
  Warnings:

  - Added the required column `cpf` to the `EventPeople` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventPeople" ADD COLUMN     "cpf" TEXT NOT NULL;
