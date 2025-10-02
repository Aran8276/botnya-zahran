-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'AWAIT_REGISTER');

-- CreateEnum
CREATE TYPE "OutputType" AS ENUM ('TEXT', 'IMAGE', 'INBUILT_COMMAND', 'JAVASCRIPT');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('REPEAT', 'ONCE');

-- CreateTable
CREATE TABLE "SystemStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "botOwnerSerializedId" TEXT NOT NULL,
    "totalCommandOutputs" INTEGER NOT NULL DEFAULT 0,
    "totalUnoGames" INTEGER NOT NULL DEFAULT 0,
    "totalBlackjackGames" INTEGER NOT NULL DEFAULT 0,
    "totalMarbleRunGames" INTEGER NOT NULL DEFAULT 0,
    "firstRegistered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "serializedId" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'AWAIT_REGISTER',
    "commandUsageCount" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commands" (
    "id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "commandUsageCount" INTEGER NOT NULL DEFAULT 0,
    "outputType" "OutputType" NOT NULL DEFAULT 'TEXT',
    "outputText" TEXT,
    "outputImageUrl" TEXT,
    "outputInbuiltCommand" TEXT,
    "outputJavascript" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedAtExpiration" TIMESTAMP(3),
    "scheduleId" TEXT,
    "groupOptionsId" TEXT,

    CONSTRAINT "Commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "entryToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "serializedId" TEXT NOT NULL,
    "isIgnored" BOOLEAN NOT NULL DEFAULT false,
    "adminSerializedIds" TEXT[],
    "groupSchedulerId" TEXT NOT NULL,
    "groupOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupParticipants" (
    "id" TEXT NOT NULL,
    "pushName" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "serializedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "GroupParticipants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "triggerAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupSchedulerId" TEXT,
    "scheduleType" "ScheduleType" NOT NULL DEFAULT 'REPEAT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupScheduler" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupScheduler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupOptions" (
    "id" TEXT NOT NULL,
    "welcomeMessage" TEXT,
    "goodbyeMessage" TEXT,
    "enableWelcomeMessage" BOOLEAN NOT NULL DEFAULT false,
    "enableGoodbyeMessage" BOOLEAN NOT NULL DEFAULT false,
    "disableEveryone" BOOLEAN NOT NULL DEFAULT false,
    "disableUnoGame" BOOLEAN NOT NULL DEFAULT false,
    "disableBlackjackGame" BOOLEAN NOT NULL DEFAULT false,
    "disableMarbleRunGame" BOOLEAN NOT NULL DEFAULT false,
    "disableAi" BOOLEAN NOT NULL DEFAULT false,
    "lockEveryoneAdmin" BOOLEAN NOT NULL DEFAULT false,
    "scheduleCommandWeekly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "GroupOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemStats_id_key" ON "SystemStats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_serializedId_key" ON "User"("serializedId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Commands_input_key" ON "Commands"("input");

-- CreateIndex
CREATE UNIQUE INDEX "Group_serializedId_key" ON "Group"("serializedId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupSchedulerId_key" ON "Group"("groupSchedulerId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupOptionId_key" ON "Group"("groupOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupParticipants_serializedId_key" ON "GroupParticipants"("serializedId");

-- AddForeignKey
ALTER TABLE "Commands" ADD CONSTRAINT "Commands_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commands" ADD CONSTRAINT "Commands_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commands" ADD CONSTRAINT "Commands_groupOptionsId_fkey" FOREIGN KEY ("groupOptionsId") REFERENCES "GroupOptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestSession" ADD CONSTRAINT "GuestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_groupSchedulerId_fkey" FOREIGN KEY ("groupSchedulerId") REFERENCES "GroupScheduler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_groupOptionId_fkey" FOREIGN KEY ("groupOptionId") REFERENCES "GroupOptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipants" ADD CONSTRAINT "GroupParticipants_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_groupSchedulerId_fkey" FOREIGN KEY ("groupSchedulerId") REFERENCES "GroupScheduler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupScheduler" ADD CONSTRAINT "GroupScheduler_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupOptions" ADD CONSTRAINT "GroupOptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
