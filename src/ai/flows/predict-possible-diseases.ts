'use server';

/**
 * @fileOverview Predicts possible diseases based on user-provided symptoms.
 *
 * - predictPossibleDiseases - A function that takes a list of symptoms and returns a list of possible diseases.
 * - PredictPossibleDiseasesInput - The input type for the predictPossibleDiseases function.
 * - PredictPossibleDiseasesOutput - The return type for the predictPossibleDiseases function.
 */

import {ai} from '@/ai/genkit';
import { getConditionInfoTool } from '@/ai/tools/get-condition-info';
import {z} from 'genkit';

const PredictPossibleDiseasesInputSchema = z.object({
  symptoms: z
    .array(z.string())
    .describe('A list of symptoms the user is experiencing.'),
});
export type PredictPossibleDiseasesInput = z.infer<
  typeof PredictPossibleDiseasesInputSchema
>;

const PredictPossibleDiseasesOutputSchema = z.object({
  possibleDiseases: z
    .array(z.string())
    .describe('A list of possible diseases based on the symptoms.'),
});
export type PredictPossibleDiseasesOutput = z.infer<
  typeof PredictPossibleDiseasesOutputSchema
>;

export async function predictPossibleDiseases(
  input: PredictPossibleDiseasesInput
): Promise<PredictPossibleDiseasesOutput> {
  return predictPossibleDiseasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPossibleDiseasesPrompt',
  input: {schema: PredictPossibleDiseasesInputSchema},
  output: {schema: PredictPossibleDiseasesOutputSchema},
  tools: [getConditionInfoTool],
  prompt: `You are a medical assistant. Your task is to identify possible diseases based on a user's symptoms.
  1. Use the 'getConditionInfoTool' to search for the provided symptoms in the knowledge base.
  2. The tool will return a list of conditions that match the symptoms.
  3. Your output should be a direct list of the 'disease' names from the tool's results. Do not infer, add, or remove any diseases.
  
  Symptoms: {{#each symptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const predictPossibleDiseasesFlow = ai.defineFlow(
  {
    name: 'predictPossibleDiseasesFlow',
    inputSchema: PredictPossibleDiseasesInputSchema,
    outputSchema: PredictPossibleDiseasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
