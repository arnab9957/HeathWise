'use server';
/**
 * @fileOverview Flow for generating personalized diet charts based on a predicted condition and demographics.
 *
 * - generatePersonalizedDietChart - A function that generates personalized diet charts.
 * - PersonalizedDietChartInput - The input type for the generatePersonalizedDietChart function.
 * - PersonalizedDietChartOutput - The return type for the generatePersonalizedDietChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getConditionInfoTool } from '@/ai/tools/get-condition-info';

const PersonalizedDietChartInputSchema = z.object({
  predictedCondition: z
    .string()
    .describe('The predicted health condition of the user.'),
  symptoms: z.array(z.string()).describe('A list of symptoms the user is experiencing.'),
  age: z.number().describe('The age of the user in years.'),
  gender: z.string().describe('The gender of the user (male or female).'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  height: z.number().describe('The height of the user in centimeters.'),
  activityLevel: z
    .string()
    .describe(
      'The activity level of the user (sedentary, lightly active, moderately active, very active, or extra active).'
    ),
  dietaryRestrictions: z
    .string()
    .describe(
      'Any dietary restrictions or allergies the user has (e.g., vegetarian, gluten-free, nut allergy).'
    ),
});
export type PersonalizedDietChartInput = z.infer<
  typeof PersonalizedDietChartInputSchema
>;

const PersonalizedDietChartOutputSchema = z.object({
  dietChart: z
    .string()
    .describe(
      'A personalized diet chart tailored to the user, including meal suggestions and nutritional information.'
    ),
});
export type PersonalizedDietChartOutput = z.infer<
  typeof PersonalizedDietChartOutputSchema
>;

export async function generatePersonalizedDietChart(
  input: PersonalizedDietChartInput
): Promise<PersonalizedDietChartOutput> {
  return generatePersonalizedDietChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedDietChartPrompt',
  input: {schema: PersonalizedDietChartInputSchema},
  output: {schema: PersonalizedDietChartOutputSchema},
  tools: [getConditionInfoTool],
  prompt: `You are a registered dietitian creating personalized diet charts for users based on their health condition, demographics, and lifestyle.

  Use the 'getConditionInfoTool' to look up information about the user's symptoms to find relevant diet, workout, and precaution information from the knowledge base. Base your recommendations primarily on the data returned from the tool.

  Consider the following user information:
  - Predicted Condition: {{{predictedCondition}}}
  - Symptoms: {{#each symptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Age: {{{age}}} years
  - Gender: {{{gender}}}
  - Weight: {{{weight}}} kg
  - Height: {{{height}}} cm
  - Activity Level: {{{activityLevel}}}
  - Dietary Restrictions: {{{dietaryRestrictions}}}

  Create a detailed 7-day diet chart with meal suggestions (breakfast, lunch, dinner, and snacks).
  Also include a simple workout plan and any necessary precautions based on the information from the tool.

  Present the diet chart in a clear and easy-to-understand format using Markdown.
  - Use a main heading for each section (e.g., "Diet Plan", "Workout Routine", "Precautions").
  - Under each day, use bullet points for each meal (Breakfast, Lunch, Dinner, Snacks).
  - Each bullet point should be bolded.
  - Do not include any introductory or concluding text. Respond only with the diet chart.
  `,
});

const generatePersonalizedDietChartFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedDietChartFlow',
    inputSchema: PersonalizedDietChartInputSchema,
    outputSchema: PersonalizedDietChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
