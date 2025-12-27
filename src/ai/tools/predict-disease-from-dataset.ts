'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

export const predictDiseaseFromDatasetTool = ai.defineTool(
  {
    name: 'predictDiseaseFromDataset',
    description: 'Predicts disease based on symptoms using the training dataset. Returns matching diseases with confidence scores.',
    inputSchema: z.object({
      symptoms: z.array(z.string()).describe('Array of symptoms to match against the dataset'),
    }),
    outputSchema: z.object({
      predictions: z.array(z.object({
        disease: z.string(),
        matchedSymptoms: z.array(z.string()),
        confidence: z.number(),
      })),
    }),
  },
  async ({ symptoms }) => {
    const datasetPath = path.join(process.cwd(), 'docs/medicine-recommendation-system-dataset/dataset.csv');
    const csvContent = readFileSync(datasetPath, 'utf-8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });

    const predictions: Array<{ disease: string; matchedSymptoms: string[]; confidence: number }> = [];
    const diseaseMatches = new Map<string, { symptoms: string[]; count: number }>();

    for (const record of records) {
      const disease = record.Disease;
      const diseaseSymptoms = record.Symptoms.split(',').map((s: string) => s.trim().toLowerCase());
      
      const matchedSymptoms = symptoms.filter(symptom => 
        diseaseSymptoms.some(ds => ds.includes(symptom.toLowerCase()) || symptom.toLowerCase().includes(ds))
      );

      if (matchedSymptoms.length > 0) {
        if (!diseaseMatches.has(disease)) {
          diseaseMatches.set(disease, { symptoms: matchedSymptoms, count: matchedSymptoms.length });
        }
      }
    }

    for (const [disease, data] of diseaseMatches.entries()) {
      predictions.push({
        disease,
        matchedSymptoms: data.symptoms,
        confidence: Math.min((data.count / symptoms.length) * 100, 100),
      });
    }

    return { predictions: predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 5) };
  }
);
