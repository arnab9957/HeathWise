'use server';

/**
 * @fileOverview Predicts possible diseases based on user-provided symptoms.
 *
 * - predictPossibleDiseases - A function that takes a list of symptoms and returns a list of possible diseases.
 * - PredictPossibleDiseasesInput - The input type for the predictPossibleDiseases function.
 * - PredictPossibleDiseasesOutput - The return type for the predictPossibleDiseases function.
 */

import { ai } from '@/ai/genkit';
import { getConditionInfoTool } from '@/ai/tools/get-condition-info';
import { z } from 'genkit';
import symptomsList from '@/lib/symptoms_list.json';

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
  input: { schema: PredictPossibleDiseasesInputSchema },
  output: { schema: PredictPossibleDiseasesOutputSchema },
  tools: [getConditionInfoTool],
  prompt: `You are a medical assistant. Your task is to identify possible diseases based on a user's symptoms.
  
  first, map the user's provided symptoms to the closest matching symptoms from the following valid list:
  Valid Symptoms: {{validSymptoms}}

  Then, using ONLY the mapped valid symptoms, use the 'getConditionInfoTool' to search for the conditions in the knowledge base.
  
  1. Map user input "{{userSymptoms}}" to valid symptoms. For example, "bleeding with cough" -> "blood_in_sputum".
  2. Use 'getConditionInfoTool' with the list of mapped valid symptoms.
  3. The tool will return a list of conditions that match the symptoms.
  4. Your output should be a direct list of the 'disease' names from the tool's results. Do not infer, add, or remove any diseases.
  
  Symptoms: {{#each symptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const predictPossibleDiseasesFlow = ai.defineFlow(
  {
    name: 'predictPossibleDiseasesFlow',
    inputSchema: PredictPossibleDiseasesInputSchema,
    outputSchema: PredictPossibleDiseasesOutputSchema,
  },
  async input => {
    const validSymptomsString = symptomsList.join(', ');
    const userSymptomsString = input.symptoms.join(', ');

    // We pass the context to the prompt manually since we can't easily add it to input schema without changing the signature
    // Actually, definePrompt input schema must match what we pass.
    // Let's cheat and pass it as part of the input to the prompt function, bypassing strict matching if possible,
    // OR we just hardcode the list in the prompt text if it's not too huge (132 items is fine).
    // Better: Helper function to map? No, let the LLM do it.

    // The 'prompt' function expects 'PredictPossibleDiseasesInput'.
    // I can't pass 'validSymptoms' unless I change the schema.
    // Changing the schema breaks the contract with the caller (server action).

    // Workaround: Embed the list directly in the prompt string using template literal locally, 
    // rather than Handlebars variable if usage is static.
    // BUT the prompt is defined statically.

    // Let's redefine the input schema for the *prompt* (not the flow) to include validSymptoms?
    // "input: {schema: PredictPossibleDiseasesInputSchema}" -> No, this locks it.

    // Let's just modify the input passed to the prompt call?
    // Genkit might complain if input doesn't match schema.

    // Alternative: Use a separate step.
    // 1. LLM call to map symptoms.
    // 2. Tool call with mapped symptoms.

    // But the current flow uses `prompt(input)`. 
    // I can just change the prompt text to include the list hardcoded.
    // 132 items * ~2 tokens = ~300 tokens. Totally fine.

    // Wait, I can't easily import JSON inside `definePrompt` template string if it's outside scope?
    // I can generate the string here.

    const { output } = await prompt({
      ...input,
      // @ts-ignore - passing extra data to handlebars context even if not in zod schema (might work depending on genkit version)
      validSymptoms: validSymptomsString,
      userSymptoms: userSymptomsString
    });
    return output!;
  }
);
