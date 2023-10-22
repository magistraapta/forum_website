-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userRole" "role" NOT NULL DEFAULT 'user';
