'use server';
/**
 * @fileOverview A tool for retrieving health condition information from a local dataset.
 *
 * - getConditionInfoTool - A Genkit tool that allows the AI to search for condition information.
 */

import { ai } from '@/ai/genkit';
import { searchHealthData } from '@/services/health-data-service';
import { z } from 'zod';

const ConditionInfoInputSchema = z.object({
  symptoms: z
    .array(z.string())
    .describe('A list of symptoms to search for in the dataset.'),
});

const ConditionInfoOutputSchema = z.object({
    results: z.array(z.object({
        disease: z.string(),
        description: z.string(),
        medication: z.string(),
        diets: z.string(),
        workout: z.string(),
        precaution: z.string(),
    })).describe("List of matching conditions from the dataset.")
});

export const getConditionInfoTool = ai.defineTool(
  {
    name: 'getConditionInfoTool',
    description: 'Searches a local knowledge base for health conditions based on symptoms. Returns information about diseases, medications, diets, workouts, and precautions.',
    input: { schema: ConditionInfoInputSchema },
    output: { schema: ConditionInfoOutputSchema },
  },
  async (input) => {
    const searchResults = await searchHealthData(input.symptoms);
    return { results: searchResults };
  }
);
