-- CreateEnum
CREATE TYPE "SortOrder" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');

-- CreateEnum
CREATE TYPE "ScoreSource" AS ENUM ('API', 'ADMIN');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" "SortOrder" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
    "unit" TEXT NOT NULL DEFAULT 'points',
    "apiKeyHash" TEXT NOT NULL,
    "apiKeyPrefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "source" "ScoreSource" NOT NULL DEFAULT 'API',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Game_apiKeyHash_key" ON "Game"("apiKeyHash");

-- CreateIndex
CREATE UNIQUE INDEX "Player_nameKey_key" ON "Player"("nameKey");

-- CreateIndex
CREATE INDEX "Score_gameId_value_idx" ON "Score"("gameId", "value");

-- CreateIndex
CREATE INDEX "Score_gameId_submittedAt_idx" ON "Score"("gameId", "submittedAt");

-- CreateIndex
CREATE INDEX "Score_submittedAt_idx" ON "Score"("submittedAt");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
