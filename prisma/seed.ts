import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Values per 100g, from common public nutrition tables (USDA-style rounded figures).
// This is intentionally a small, hand-curated MVP dataset — see README for how to
// replace/extend it with USDA FoodData Central or Open Food Facts later.
const FOODS: Array<{
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}> = [
  { name: "arroz blanco cocido", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: "arroz integral cocido", caloriesPer100g: 123, proteinPer100g: 2.6, carbsPer100g: 25.6, fatPer100g: 1.0 },
  { name: "pechuga de pollo", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: "muslo de pollo", caloriesPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 10.9 },
  { name: "carne de ternera", caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15 },
  { name: "carne picada de cerdo", caloriesPer100g: 263, proteinPer100g: 17, carbsPer100g: 0, fatPer100g: 21 },
  { name: "salmón", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { name: "atún", caloriesPer100g: 132, proteinPer100g: 28, carbsPer100g: 0, fatPer100g: 1.3 },
  { name: "huevo", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: "pasta cocida", caloriesPer100g: 158, proteinPer100g: 5.8, carbsPer100g: 31, fatPer100g: 0.9 },
  { name: "pan blanco", caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2 },
  { name: "pan integral", caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: "patata cocida", caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1 },
  { name: "patatas fritas", caloriesPer100g: 312, proteinPer100g: 3.4, carbsPer100g: 41, fatPer100g: 15 },
  { name: "aceite de oliva", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: "mantequilla", caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81 },
  { name: "queso curado", caloriesPer100g: 402, proteinPer100g: 26, carbsPer100g: 1.3, fatPer100g: 33 },
  { name: "queso fresco", caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3 },
  { name: "yogur natural", caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3 },
  { name: "leche entera", caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3 },
  { name: "lechuga", caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2 },
  { name: "tomate", caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { name: "cebolla", caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
  { name: "aguacate", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7 },
  { name: "brócoli", caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4 },
  { name: "zanahoria", caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2 },
  { name: "espinaca", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "plátano", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { name: "manzana", caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
  { name: "naranja", caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1 },
  { name: "fresa", caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3 },
  { name: "frutos secos mixtos", caloriesPer100g: 607, proteinPer100g: 20, carbsPer100g: 21, fatPer100g: 54 },
  { name: "almendras", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: "garbanzos cocidos", caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27, fatPer100g: 2.6 },
  { name: "lentejas cocidas", caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4 },
  { name: "judías negras cocidas", caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5 },
  { name: "tofu", caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8 },
  { name: "salsa de tomate", caloriesPer100g: 29, proteinPer100g: 1.6, carbsPer100g: 6, fatPer100g: 0.2 },
  { name: "mayonesa", caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 2, fatPer100g: 75 },
  { name: "chocolate negro", caloriesPer100g: 546, proteinPer100g: 4.9, carbsPer100g: 61, fatPer100g: 31 },
  { name: "pizza margarita", caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10 },
  { name: "hamburguesa", caloriesPer100g: 295, proteinPer100g: 17, carbsPer100g: 24, fatPer100g: 14 },
  { name: "sushi (variado)", caloriesPer100g: 150, proteinPer100g: 6, carbsPer100g: 28, fatPer100g: 1 },
  { name: "avena", caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7 },
  { name: "quinoa cocida", caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9 },
  { name: "jamón cocido", caloriesPer100g: 107, proteinPer100g: 18, carbsPer100g: 1.5, fatPer100g: 3.5 },
  { name: "jamón serrano", caloriesPer100g: 241, proteinPer100g: 31, carbsPer100g: 0.4, fatPer100g: 13 },

  // Más proteínas
  { name: "pechuga de pavo", caloriesPer100g: 135, proteinPer100g: 29, carbsPer100g: 0, fatPer100g: 1.7 },
  { name: "lomo de cerdo", caloriesPer100g: 143, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 6 },
  { name: "chuleta de cerdo", caloriesPer100g: 231, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 14 },
  { name: "merluza", caloriesPer100g: 86, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 1 },
  { name: "bacalao", caloriesPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 0.7 },
  { name: "gambas", caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3 },
  { name: "calamar", caloriesPer100g: 92, proteinPer100g: 16, carbsPer100g: 3.1, fatPer100g: 1.4 },
  { name: "huevo frito", caloriesPer100g: 196, proteinPer100g: 14, carbsPer100g: 0.9, fatPer100g: 15 },
  { name: "chorizo", caloriesPer100g: 455, proteinPer100g: 24, carbsPer100g: 1.9, fatPer100g: 38 },
  { name: "salchicha", caloriesPer100g: 300, proteinPer100g: 12, carbsPer100g: 3, fatPer100g: 27 },

  // Cereales, pasta y legumbres
  { name: "macarrones cocidos", caloriesPer100g: 158, proteinPer100g: 5.8, carbsPer100g: 31, fatPer100g: 0.9 },
  { name: "cuscús cocido", caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23, fatPer100g: 0.2 },
  { name: "judías blancas cocidas", caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 23, fatPer100g: 0.5 },
  { name: "guisantes cocidos", caloriesPer100g: 84, proteinPer100g: 5.4, carbsPer100g: 14, fatPer100g: 0.4 },
  { name: "cereales de desayuno", caloriesPer100g: 378, proteinPer100g: 7, carbsPer100g: 82, fatPer100g: 2 },
  { name: "galletas maría", caloriesPer100g: 436, proteinPer100g: 7.5, carbsPer100g: 75, fatPer100g: 12 },
  { name: "croissant", caloriesPer100g: 406, proteinPer100g: 8, carbsPer100g: 45, fatPer100g: 21 },

  // Verduras
  { name: "pepino", caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
  { name: "pimiento rojo", caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3 },
  { name: "champiñones", caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3 },
  { name: "calabacín", caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3 },
  { name: "berenjena", caloriesPer100g: 25, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.2 },
  { name: "coliflor", caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3 },
  { name: "maíz dulce", caloriesPer100g: 96, proteinPer100g: 3.4, carbsPer100g: 21, fatPer100g: 1.5 },

  // Frutas
  { name: "kiwi", caloriesPer100g: 61, proteinPer100g: 1.1, carbsPer100g: 15, fatPer100g: 0.5 },
  { name: "mango", caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4 },
  { name: "piña", caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1 },
  { name: "sandía", caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2 },
  { name: "melón", caloriesPer100g: 34, proteinPer100g: 0.8, carbsPer100g: 8, fatPer100g: 0.2 },
  { name: "uvas", caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2 },
  { name: "pera", caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15, fatPer100g: 0.1 },

  // Lácteos
  { name: "yogur griego", caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 4, fatPer100g: 5 },
  { name: "leche desnatada", caloriesPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1 },
  { name: "queso mozzarella", caloriesPer100g: 280, proteinPer100g: 22, carbsPer100g: 2.2, fatPer100g: 21 },
  { name: "queso parmesano", caloriesPer100g: 431, proteinPer100g: 38, carbsPer100g: 4.1, fatPer100g: 29 },
  { name: "nata para cocinar", caloriesPer100g: 292, proteinPer100g: 2.2, carbsPer100g: 3.4, fatPer100g: 30 },

  // Platos y salsas
  { name: "paella mixta", caloriesPer100g: 172, proteinPer100g: 9, carbsPer100g: 22, fatPer100g: 5 },
  { name: "tortilla de patatas", caloriesPer100g: 190, proteinPer100g: 6.5, carbsPer100g: 13, fatPer100g: 12 },
  { name: "croquetas", caloriesPer100g: 260, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 17 },
  { name: "gazpacho", caloriesPer100g: 40, proteinPer100g: 1, carbsPer100g: 5, fatPer100g: 2 },
  { name: "ensaladilla rusa", caloriesPer100g: 190, proteinPer100g: 3, carbsPer100g: 12, fatPer100g: 14 },
  { name: "salsa alioli", caloriesPer100g: 650, proteinPer100g: 1, carbsPer100g: 2, fatPer100g: 71 },
  { name: "kétchup", caloriesPer100g: 112, proteinPer100g: 1.2, carbsPer100g: 27, fatPer100g: 0.2 },
  { name: "mostaza", caloriesPer100g: 66, proteinPer100g: 4.4, carbsPer100g: 6, fatPer100g: 3.3 },

  // Bebidas y dulces
  { name: "refresco de cola", caloriesPer100g: 42, proteinPer100g: 0, carbsPer100g: 10.6, fatPer100g: 0 },
  { name: "zumo de naranja", caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10.4, fatPer100g: 0.2 },
  { name: "cerveza", caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 3.6, fatPer100g: 0 },
  { name: "vino tinto", caloriesPer100g: 85, proteinPer100g: 0.1, carbsPer100g: 2.6, fatPer100g: 0 },
  { name: "donut", caloriesPer100g: 452, proteinPer100g: 4.9, carbsPer100g: 51, fatPer100g: 25 },
  { name: "magdalena", caloriesPer100g: 393, proteinPer100g: 6, carbsPer100g: 55, fatPer100g: 16 },
  { name: "tarta de queso", caloriesPer100g: 321, proteinPer100g: 5.5, carbsPer100g: 26, fatPer100g: 22 },
];

async function main() {
  for (const food of FOODS) {
    await prisma.foodReference.upsert({
      where: { name: food.name },
      update: food,
      create: food,
    });
  }
  console.log(`Seeded ${FOODS.length} food references.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
