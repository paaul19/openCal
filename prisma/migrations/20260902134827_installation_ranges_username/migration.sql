-- CreateTable
CREATE TABLE "Installation" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "imageUrl" TEXT,
    "minCalories" DOUBLE PRECISION NOT NULL,
    "maxCalories" DOUBLE PRECISION NOT NULL,
    "minProtein" DOUBLE PRECISION NOT NULL,
    "maxProtein" DOUBLE PRECISION NOT NULL,
    "minCarbs" DOUBLE PRECISION NOT NULL,
    "maxCarbs" DOUBLE PRECISION NOT NULL,
    "minFat" DOUBLE PRECISION NOT NULL,
    "maxFat" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "gramsMin" DOUBLE PRECISION NOT NULL,
    "gramsMax" DOUBLE PRECISION NOT NULL,
    "minCalories" DOUBLE PRECISION NOT NULL,
    "maxCalories" DOUBLE PRECISION NOT NULL,
    "minProtein" DOUBLE PRECISION NOT NULL,
    "maxProtein" DOUBLE PRECISION NOT NULL,
    "minCarbs" DOUBLE PRECISION NOT NULL,
    "maxCarbs" DOUBLE PRECISION NOT NULL,
    "minFat" DOUBLE PRECISION NOT NULL,
    "maxFat" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodReference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "caloriesPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FoodReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Meal_userId_createdAt_idx" ON "Meal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FoodItem_mealId_idx" ON "FoodItem"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodReference_name_key" ON "FoodReference"("name");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
