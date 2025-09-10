'use server';

/**
 * @fileOverview Suggests appropriate medications based on the predicted disease and patient profile.
 *
 * - suggestAppropriateMedications - A function that suggests medications based on disease prediction and user profile.
 * - SuggestAppropriateMedicationsInput - The input type for the suggestAppropriateMedications function.
 * - SuggestAppropriateMedicationsOutput - The return type for the suggestAppropriateMedications function.
 */

import {ai} from '@/ai/genkit';
import { getConditionInfoTool } from '@/ai/tools/get-condition-info';
import {z} from 'genkit';

const SuggestAppropriateMedicationsInputSchema = z.object({
  predictedDisease: z
    .string()
    .describe('The disease predicted by the disease prediction model.'),
  symptoms: z.array(z.string()).describe('A list of symptoms the user is experiencing.'),
  patientProfile: z
    .string()
    .describe(
      'The profile of the patient, including age, sex, and medical history.'
    ),
});

export type SuggestAppropriateMedicationsInput = z.infer<
  typeof SuggestAppropriateMedicationsInputSchema
>;

const SuggestAppropriateMedicationsOutputSchema = z.object({
  medicationSuggestions: z
    .string()
    .describe(
      'A list of suggested medications based on the predicted disease and patient profile.'
    ),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer stating that the suggestions are not a substitute for professional medical advice and that the user should consult with their healthcare provider before taking any medication.'
    ),
});

export type SuggestAppropriateMedicationsOutput = z.infer<
  typeof SuggestAppropriateMedicationsOutputSchema
>;

export async function suggestAppropriateMedications(
  input: SuggestAppropriateMedicationsInput
): Promise<SuggestAppropriateMedicationsOutput> {
  return suggestAppropriateMedicationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAppropriateMedicationsPrompt',
  input: {schema: SuggestAppropriateMedicationsInputSchema},
  output: {schema: SuggestAppropriateMedicationsOutputSchema},
  tools: [getConditionInfoTool],
  prompt: `You are a medical expert specializing in medication recommendations.
  1. Use the 'getConditionInfoTool' to look up information about the user's symptoms.
  2. The tool will return a list of conditions, including relevant medications.
  3. From the tool's results, find the entry that matches the '{{{predictedDisease}}}'.
  4. List the exact medications provided in the 'medication' field for that disease.
  5. Format the output as a clean, bulleted list. Each medication should be bolded.

  Patient Profile: {{{patientProfile}}}

  Include a standard disclaimer: "These suggestions are not a substitute for professional medical advice. Always consult with your healthcare provider before taking any medication."
`,
});

const suggestAppropriateMedicationsFlow = ai.defineFlow(
  {
    name: 'suggestAppropriateMedicationsFlow',
    inputSchema: SuggestAppropriateMedicationsInputSchema,
    outputSchema: SuggestAppropriateMedicationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
