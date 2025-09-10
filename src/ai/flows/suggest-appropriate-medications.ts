'use server';

/**
 * @fileOverview Suggests appropriate medications based on the predicted disease and patient profile.
 *
 * - suggestAppropriateMedications - A function that suggests medications based on disease prediction and user profile.
 * - SuggestAppropriateMedicationsInput - The input type for the suggestAppropriateMedications function.
 * - SuggestAppropriateMedicationsOutput - The return type for the suggestAppropriateMedications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAppropriateMedicationsInputSchema = z.object({
  predictedDisease: z
    .string()
    .describe('The disease predicted by the disease prediction model.'),
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
  prompt: `You are a medical expert specializing in medication recommendations.

Based on the predicted disease and patient profile, suggest a list of appropriate over-the-counter medications. For each suggestion, provide a brief, one-sentence description of what it is used for.

Use a clear, bulleted list format for the suggestions.

Predicted Disease: {{{predictedDisease}}}
Patient Profile: {{{patientProfile}}}

Example format:
- **Ibuprofen**: A nonsteroidal anti-inflammatory drug (NSAID) used for pain relief and reducing fever.
- **Acetaminophen**: An analgesic and antipyretic used to treat pain and fever.
- **Loratadine**: An antihistamine used to treat allergies.

Include a disclaimer that these suggestions are not a substitute for professional medical advice and that the user should consult with their healthcare provider before taking any medication.
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
