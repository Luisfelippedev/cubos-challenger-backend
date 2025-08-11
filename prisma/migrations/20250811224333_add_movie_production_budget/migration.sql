/*
  Warnings:

  - Added the required column `productionBudget` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "productionBudget" DECIMAL(14,2) NOT NULL;
