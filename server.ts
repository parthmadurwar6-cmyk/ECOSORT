import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

type WasteCategory = 'dry' | 'wet' | 'ewaste' | 'hazardous';

const CATEGORY_LABELS: Record<WasteCategory, string> = {
  dry: 'Dry / Recyclable Waste',
  wet: 'Wet / Organic Waste',
  ewaste: 'E-Waste',
  hazardous: 'Hazardous / Special Waste',
};

const SYSTEM_INSTRUCTION = `You are EcoSort's precision environmental waste vision specialist for Indian municipal source segregation (4-stream system: Blue Bin Dry/Recyclable, Green Bin Wet/Organic, Authorized E-Waste Hub, Hazardous/Special Drop-Off).

Your job is to inspect the ACTUAL uploaded photograph carefully and identify the real object(s) present—never guess a generic item if something else is pictured.

Classification rules:
1. "dry" (Blue Bin — Dry / Recyclable Waste):
   - Clean plastics (PET bottles, HDPE jugs, shampoo bottles, clean LDPE milk pouches, food containers), paper, cardboard, newspapers, magazines, Tetra Pak cartons, glass bottles/jars, aluminium cans, tin cans, scrap metal.
   - Note: Clean pizza box lids are dry; grease-soaked food cardboard or soiled napkins go to "wet".
2. "wet" (Green Bin — Wet / Organic Waste):
   - Fruit & vegetable peels, leftover food, coffee grounds, tea leaves, eggshells, garden trimmings, flowers, grease-stained paper/cardboard.
3. "ewaste" (Authorized E-Waste Hub):
   - Mobile phones, chargers, USB cables, laptops, keyboards, circuit boards, power banks, earphones, remotes, small appliances, LED bulbs/electronics.
4. "hazardous" (Hazardous / Special Drop-Off):
   - Expired medicine strips/blister packs, pharmaceutical bottles, syringes/sharps, AA/AAA/button/lithium loose batteries, CFL mercury bulbs, paint/pesticide cans, chemical cleaners, medical bandages.

Special edge cases:
- If the photo shows multiple items, identify the primary foreground waste item and mention secondary items in detectedSummary and disposalSteps.
- If the photo is blurry, dark, or does NOT clearly show a household/discardable object (e.g., an empty wall, landscape, person's face, or abstract pattern), set isWasteItem to false, keep confidence below 45, name honestly what is visible in the photo, and instruct the user to retake a closer photo on a clear surface.
- Always base itemName and detectedSummary strictly on what you visually observe in the image.`;

function normalizeBreakdown(
  raw: Record<string, unknown> | undefined,
  primary: WasteCategory
) {
  const keys: WasteCategory[] = ['dry', 'wet', 'ewaste', 'hazardous'];
  const vals: Record<WasteCategory, number> = {
    dry: Math.max(0, Math.round(Number(raw?.dry ?? 0))),
    wet: Math.max(0, Math.round(Number(raw?.wet ?? 0))),
    ewaste: Math.max(0, Math.round(Number(raw?.ewaste ?? 0))),
    hazardous: Math.max(0, Math.round(Number(raw?.hazardous ?? 0))),
  };

  let sum = vals.dry + vals.wet + vals.ewaste + vals.hazardous;
  if (sum <= 0) {
    vals.dry = primary === 'dry' ? 90 : 4;
    vals.wet = primary === 'wet' ? 90 : 3;
    vals.ewaste = primary === 'ewaste' ? 90 : 4;
    vals.hazardous = primary === 'hazardous' ? 90 : 3;
    sum = vals.dry + vals.wet + vals.ewaste + vals.hazardous;
  }

  const scaled: Record<WasteCategory, number> = {
    dry: Math.round((vals.dry / sum) * 100),
    wet: Math.round((vals.wet / sum) * 100),
    ewaste: Math.round((vals.ewaste / sum) * 100),
    hazardous: Math.round((vals.hazardous / sum) * 100),
  };

  let maxKey = primary;
  for (const k of keys) {
    if (scaled[k] > scaled[maxKey]) maxKey = k;
  }
  if (maxKey !== primary) {
    const tmp = scaled[primary];
    scaled[primary] = scaled[maxKey];
    scaled[maxKey] = tmp;
  }

  const total = scaled.dry + scaled.wet + scaled.ewaste + scaled.hazardous;
  scaled[primary] = Math.max(1, scaled[primary] + (100 - total));

  return scaled;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/classify-waste', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'AI vision service is not configured yet. Please ensure GEMINI_API_KEY is set in Settings > Secrets.',
        });
        return;
      }

      const { imageBase64, mimeType } = req.body ?? {};
      if (
        typeof imageBase64 !== 'string' ||
        imageBase64.trim().length < 32 ||
        typeof mimeType !== 'string' ||
        !ALLOWED_MIME_TYPES.has(mimeType)
      ) {
        res.status(400).json({
          error:
            'Please provide a valid image file (JPEG, PNG, WebP, or GIF) to classify.',
        });
        return;
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const runVisionRequest = async () =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: 'Examine this real photograph carefully. Identify the exact object(s) shown, describe visual evidence you observe, classify into one of the four EcoSort streams (dry, wet, ewaste, hazardous), provide realistic probability scores across all four streams summing to 100, and give 3-4 practical item-specific disposal preparation steps.',
              },
            ],
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                itemName: {
                  type: Type.STRING,
                  description:
                    'Specific short name of the identified object in the photo (e.g., "Clear PET Plastic Bottle", "Banana Peel", "Cracked Smartphone", "Expired Medicine Blister Strip", "Aluminium Beverage Can").',
                },
                detectedSummary: {
                  type: Type.STRING,
                  description:
                    'One concise sentence describing the exact visual details seen in the photograph.',
                },
                category: {
                  type: Type.STRING,
                  description:
                    'Must be exactly one of: "dry", "wet", "ewaste", or "hazardous".',
                },
                confidence: {
                  type: Type.INTEGER,
                  description: 'Confidence score from 0 to 100.',
                },
                recommendedAction: {
                  type: Type.STRING,
                  description:
                    'Clear bin or drop-off destination banner (e.g., "Blue Bin — Dry / Recyclable — Recycling / Dry Waste Collection").',
                },
                prepTip: {
                  type: Type.STRING,
                  description:
                    'Very concise 4-8 word preparation summary (e.g., "Empty, rinse, crush with cap.").',
                },
                disposalSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    '3 to 4 actionable, item-specific preparation and disposal instructions.',
                },
                probabilityBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    dry: { type: Type.INTEGER },
                    wet: { type: Type.INTEGER },
                    ewaste: { type: Type.INTEGER },
                    hazardous: { type: Type.INTEGER },
                  },
                  required: ['dry', 'wet', 'ewaste', 'hazardous'],
                },
                materialTags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    '1 to 3 matching recycling centre stream tags from: Plastic, Paper, Glass, Metal, General recycling, E-waste, Hazardous, Organic.',
                },
                isWasteItem: {
                  type: Type.BOOLEAN,
                  description:
                    'True if an identifiable item/object for sorting or disposal is visible in the photo; false if unreadable or non-item scene.',
                },
              },
              required: [
                'itemName',
                'detectedSummary',
                'category',
                'confidence',
                'recommendedAction',
                'prepTip',
                'disposalSteps',
                'probabilityBreakdown',
                'materialTags',
                'isWasteItem',
              ],
            },
          },
        });

      let response;
      try {
        response = await runVisionRequest();
      } catch (firstErr) {
        const firstMsg =
          firstErr instanceof Error ? firstErr.message : String(firstErr);
        if (
          firstMsg.includes('API_KEY_INVALID') ||
          firstMsg.includes('PERMISSION_DENIED') ||
          firstMsg.includes('403')
        ) {
          throw firstErr;
        }
        await new Promise((r) => setTimeout(r, 700));
        response = await runVisionRequest();
      }

      const rawText = (response.text ?? '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      if (!rawText) {
        res.status(502).json({
          error: 'The vision model returned an empty response. Please try again.',
        });
        return;
      }

      const parsed = JSON.parse(rawText) as Record<string, unknown>;
      const rawCat = String(parsed.category ?? 'dry').toLowerCase();
      const category: WasteCategory =
        rawCat === 'wet' ||
        rawCat === 'ewaste' ||
        rawCat === 'hazardous' ||
        rawCat === 'dry'
          ? (rawCat as WasteCategory)
          : 'dry';

      const breakdown = normalizeBreakdown(
        parsed.probabilityBreakdown as Record<string, unknown> | undefined,
        category
      );

      const confidence = Math.max(
        10,
        Math.min(99, breakdown[category])
      );

      const disposalSteps = Array.isArray(parsed.disposalSteps)
        ? parsed.disposalSteps
            .map((s) => String(s).trim())
            .filter(Boolean)
            .slice(0, 5)
        : [];

      const materialTags = Array.isArray(parsed.materialTags)
        ? parsed.materialTags
            .map((t) => String(t).trim())
            .filter(Boolean)
            .slice(0, 4)
        : [];

      res.json({
        itemName: String(parsed.itemName ?? 'Unidentified Item').trim(),
        detectedSummary: String(
          parsed.detectedSummary ?? 'Analyzed uploaded photograph.'
        ).trim(),
        category,
        categoryLabel: CATEGORY_LABELS[category],
        confidence,
        recommendedAction: String(
          parsed.recommendedAction ?? CATEGORY_LABELS[category]
        ).trim(),
        prepTip: String(
          parsed.prepTip ?? 'Follow local segregation prep steps.'
        ).trim(),
        disposalSteps:
          disposalSteps.length > 0
            ? disposalSteps
            : ['Keep clean and separate from other waste streams before disposal.'],
        probabilityBreakdown: breakdown,
        materialTags,
        isWasteItem: Boolean(parsed.isWasteItem ?? true),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected classification error';
      console.error('Classify waste API error:', message);
      if (
        message.includes('API_KEY_INVALID') ||
        message.includes('PERMISSION_DENIED') ||
        message.includes('403')
      ) {
        res.status(403).json({
          error:
            'Gemini API key could not be verified. Please check your key in Settings > Secrets.',
        });
        return;
      }
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
        res.status(429).json({
          error:
            'AI classification rate limit reached temporarily. Please wait a moment and try again.',
        });
        return;
      }
      res.status(500).json({
        error: 'Could not classify this photo right now. Please try again.',
      });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`EcoSort server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
