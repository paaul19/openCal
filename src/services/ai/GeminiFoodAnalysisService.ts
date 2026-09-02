import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { foodAnalysisResultSchema, type DetectedFood } from "@/lib/validation";
import { FoodAnalysisError, type FoodAnalysisService } from "./FoodAnalysisService";

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    foods: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          estimatedGramsMin: { type: SchemaType.NUMBER },
          estimatedGramsMax: { type: SchemaType.NUMBER },
          confidence: { type: SchemaType.NUMBER },
        },
        required: ["name", "estimatedGramsMin", "estimatedGramsMax", "confidence"],
      },
    },
  },
  required: ["foods"],
};

const PROMPT = `Eres un asistente experto en nutrición que analiza fotografías de comida.

Analiza la imagen y detecta TODOS los alimentos visibles, incluyendo:
- ingredientes principales
- platos compuestos (identifica sus componentes por separado si es posible)
- salsas y aderezos
- toppings
- aceites o grasas visibles

Para cada alimento estima:
- name: nombre corto y claro en español (ej. "arroz blanco cocido", "pechuga de pollo a la plancha")
- estimatedGramsMin / estimatedGramsMax: un RANGO de peso estimado en gramos, no un número exacto.
  Una fotografía nunca permite conocer el peso exacto, así que el rango debe reflejar tu incertidumbre
  real (una ración claramente definida puede tener un rango estrecho; un alimento parcialmente oculto,
  amontonado o de forma irregular debe tener un rango más amplio).
- confidence: tu confianza en la detección y en la estimación, de 0 a 1

Si la imagen no contiene comida claramente identificable, o está demasiado oscura/borrosa
para estimar algo con un mínimo de fiabilidad, devuelve una lista de "foods" vacía.

Responde ÚNICAMENTE con el JSON solicitado, sin texto adicional.`;

const TIMEOUT_MS = 20_000;

export class GeminiFoodAnalysisService implements FoodAnalysisService {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = "gemini-3.5-flash-lite") {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required to use GeminiFoodAnalysisService");
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async analyzeFoodImage(image: { base64: string; mimeType: string }): Promise<DetectedFood[]> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let raw: string;
    try {
      const result = await model.generateContent(
        {
          contents: [
            {
              role: "user",
              parts: [
                { text: PROMPT },
                { inlineData: { mimeType: image.mimeType, data: image.base64 } },
              ],
            },
          ],
        },
        { signal: controller.signal },
      );
      raw = result.response.text();
    } catch (error) {
      if (controller.signal.aborted) {
        throw new FoodAnalysisError("El análisis ha tardado demasiado. Inténtalo de nuevo.", "TIMEOUT");
      }
      const message = error instanceof Error ? error.message : String(error);
      const statusMatch = /\[(\d{3})\s/.exec(message);
      const status = statusMatch ? Number(statusMatch[1]) : null;
      if (status === 429) {
        throw new FoodAnalysisError("Límite de peticiones a Gemini alcanzado. Espera un momento.", "RATE_LIMIT");
      }
      console.error("Gemini request failed", message);
      throw new FoodAnalysisError("No se ha podido contactar con el servicio de análisis.", "PROVIDER_ERROR");
    } finally {
      clearTimeout(timeout);
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      throw new FoodAnalysisError("La respuesta del análisis no tiene un formato válido.", "INVALID_RESPONSE");
    }

    const validated = foodAnalysisResultSchema.safeParse(parsedJson);
    if (!validated.success) {
      throw new FoodAnalysisError("La respuesta del análisis no tiene un formato válido.", "INVALID_RESPONSE");
    }

    if (validated.data.foods.length === 0) {
      throw new FoodAnalysisError(
        "No hemos podido identificar la comida con suficiente confianza. Prueba con una fotografía más clara y desde arriba.",
        "NO_FOOD_DETECTED",
      );
    }

    return validated.data.foods;
  }
}

let singleton: GeminiFoodAnalysisService | null = null;

export function getFoodAnalysisService(): FoodAnalysisService {
  if (!singleton) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new FoodAnalysisError("El servicio de análisis no está configurado (falta GEMINI_API_KEY).", "PROVIDER_ERROR");
    }
    singleton = new GeminiFoodAnalysisService(apiKey, process.env.GEMINI_MODEL);
  }
  return singleton;
}
