/*
  Warnings:

  - You are about to drop the column `borrowedAt` on the `Emprunt` table. All the data in the column will be lost.
  - You are about to drop the column `returnedAt` on the `Emprunt` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Emprunt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Emprunt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmpruntStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Emprunt" DROP COLUMN "borrowedAt",
DROP COLUMN "returnedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "EmpruntStatus" NOT NULL DEFAULT 'PENDING';
