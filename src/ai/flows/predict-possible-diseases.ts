'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

const PredictPossibleDiseasesInputSchema = z.object({
  symptoms: z.array(z.string()).describe('A list of symptoms the user is experiencing.'),
});
export type PredictPossibleDiseasesInput = z.infer<typeof PredictPossibleDiseasesInputSchema>;

const PredictPossibleDiseasesOutputSchema = z.object({
  possibleDiseases: z.array(z.string()).describe('A list of possible diseases based on the symptoms.'),
  source: z.enum(['database', 'ai']).describe('Whether the prediction came from the database or AI'),
  confidence: z.string().optional().describe('Confidence level of the prediction'),
});
export type PredictPossibleDiseasesOutput = z.infer<typeof PredictPossibleDiseasesOutputSchema>;

export async function predictPossibleDiseases(input: PredictPossibleDiseasesInput): Promise<PredictPossibleDiseasesOutput> {
  try {
    console.log('🔍 Searching database for symptoms:', input.symptoms);
    const datasetPath = path.join(process.cwd(), 'docs/medicine-recommendation-system-dataset/dataset.csv');
    const csvContent = readFileSync(datasetPath, 'utf-8');
    type DatasetRecord = {
      Disease: string;
      Symptoms: string;
    };
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as DatasetRecord[];

    const diseaseMatches = new Map<string, number>();

    for (const record of records) {
      const disease = record.Disease;
      const diseaseSymptoms = record.Symptoms.split(',').map((s: string) => s.trim().toLowerCase());

      const matchCount = input.symptoms.filter(symptom =>
        diseaseSymptoms.some(ds => ds.includes(symptom.toLowerCase()) || symptom.toLowerCase().includes(ds))
      ).length;

      if (matchCount > 0) {
        diseaseMatches.set(disease, (diseaseMatches.get(disease) || 0) + matchCount);
      }
    }

    const sortedDiseases = Array.from(diseaseMatches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([disease]) => disease);

    if (sortedDiseases.length === 0) {
      console.log('⚠️ No matches found in database. Using Gemini AI for prediction...');
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `You are a medical AI assistant. Based on the following symptoms, predict 3-5 possible diseases or medical conditions.

Symptoms: ${input.symptoms.join(', ')}

Provide ONLY the disease names, one per line, without numbering, bullets, or explanations. Be specific and medically accurate.`,
        output: {
          schema: z.object({
            diseases: z.array(z.string()).describe('List of possible diseases'),
            reasoning: z.string().describe('Brief explanation of the prediction'),
          }),
        },
      });

      console.log('🤖 AI Prediction completed:', output?.diseases || []);
      return {
        possibleDiseases: output?.diseases || [],
        source: 'ai',
        confidence: 'AI-generated prediction based on symptom analysis'
      };
    }

    console.log('✅ Found matches in database:', sortedDiseases);
    return {
      possibleDiseases: sortedDiseases,
      source: 'database',
      confidence: `Matched ${diseaseMatches.get(sortedDiseases[0])} symptoms`,
    };
  } catch (error) {
    console.error('❌ Error accessing database. Falling back to Gemini AI:', error);
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `You are a medical AI assistant. Based on the following symptoms, predict 3-5 possible diseases or medical conditions.

Symptoms: ${input.symptoms.join(', ')}

Provide ONLY the disease names, one per line, without numbering, bullets, or explanations. Be specific and medically accurate.`,
      output: {
        schema: z.object({
          diseases: z.array(z.string()).describe('List of possible diseases'),
          reasoning: z.string().describe('Brief explanation of the prediction'),
        }),
      },
    });

    console.log('🤖 AI Fallback prediction completed:', output?.diseases || []);
    return {
      possibleDiseases: output?.diseases || [],
      source: 'ai',
      confidence: 'AI-generated prediction (database unavailable)',
    };
  }
}
