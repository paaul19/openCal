import { z } from "zod";

// openCal is self-hosted and never sends email — accounts are username + password only.
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "El usuario debe tener al menos 3 caracteres")
  .max(24, "El usuario debe tener como máximo 24 caracteres")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Solo letras, números, puntos, guiones y guiones bajos");

export const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const setupSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("single") }),
  z.object({ mode: z.literal("multi"), username: usernameSchema, password: passwordSchema }),
]);

// A single food item as returned by the AI analysis service. Gemini estimates
// a portion-size RANGE (not a single gram figure) because a photo can't tell
// you the exact weight — see NutritionService for how this becomes a
// calorie/macro range.
export const detectedFoodSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    estimatedGramsMin: z.number().finite().positive().max(3000),
    estimatedGramsMax: z.number().finite().positive().max(3000),
    confidence: z.number().min(0).max(1),
  })
  .refine((food) => food.estimatedGramsMax >= food.estimatedGramsMin, {
    message: "estimatedGramsMax must be >= estimatedGramsMin",
  });

export const foodAnalysisResultSchema = z.object({
  foods: z.array(detectedFoodSchema).max(20),
});

export type DetectedFood = z.infer<typeof detectedFoodSchema>;
export type FoodAnalysisResult = z.infer<typeof foodAnalysisResultSchema>;

// Request body for POST /api/meals (saving a meal built from edited food items).
export const saveMealItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  grams: z.number().finite().positive().max(5000),
  gramsMin: z.number().finite().positive().max(5000).optional(),
  gramsMax: z.number().finite().positive().max(5000).optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
});

export const saveMealSchema = z.object({
  items: z.array(saveMealItemSchema).min(1).max(30),
});

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6MB safety ceiling after client-side compression
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
