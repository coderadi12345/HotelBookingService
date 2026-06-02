/*
  Warnings:

  - Added the required column `totalBooking` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `totalBooking` INTEGER NOT NULL;

