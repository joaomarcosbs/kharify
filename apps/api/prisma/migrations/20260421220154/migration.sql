/*
  Warnings:

  - The values [familia,mei,pme] on the enum `OrganizationType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebook_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[apple_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google', 'facebook', 'apple');

-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationType_new" AS ENUM ('pessoal', 'empresarial');
ALTER TABLE "organizations" ALTER COLUMN "type" TYPE "OrganizationType_new" USING ("type"::text::"OrganizationType_new");
ALTER TYPE "OrganizationType" RENAME TO "OrganizationType_old";
ALTER TYPE "OrganizationType_new" RENAME TO "OrganizationType";
DROP TYPE "public"."OrganizationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "document" VARCHAR(14);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "apple_id" TEXT,
ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'email',
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_id_key" ON "users"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_key" ON "users"("apple_id");
