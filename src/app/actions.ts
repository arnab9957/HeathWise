'use server';

import type { HealthFormData, AnalysisResult } from '@/lib/schemas';
import { predictPossibleDiseases } from '@/ai/flows/predict-possible-diseases';
import { suggestAppropriateMedications } from '@/ai/flows/suggest-appropriate-medications';
import { generatePersonalizedDietChart } from '@/ai/flows/generate-personalized-diet-charts';

export async function getHealthAnalysis(data: HealthFormData): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
    try {
        const symptomsArray = data.symptoms.split(',').map(s => s.trim()).filter(s => s);
        if (symptomsArray.length === 0) {
            return { success: false, error: 'Please provide at least one symptom.' };
        }

        const diseasePrediction = await predictPossibleDiseases({ symptoms: symptomsArray });
        const predictedDisease = diseasePrediction.possibleDiseases[0] || 'general wellness';

        const patientProfile = `Age: ${data.age}, Gender: ${data.gender}, Weight: ${data.weight}kg, Height: ${data.height}cm. Activity Level: ${data.activityLevel.replace(/_/g, ' ')}. Dietary Restrictions: ${data.dietaryRestrictions || 'None'}.`;

        const [medicationSuggestion, dietChartData] = await Promise.all([
            suggestAppropriateMedications({
                predictedDisease,
                patientProfile,
            }),
            generatePersonalizedDietChart({
                predictedCondition: predictedDisease,
                age: data.age,
                gender: data.gender,
                weight: data.weight,
                height: data.height,
                activityLevel: data.activityLevel.replace(/_/g, ' '),
                dietaryRestrictions: data.dietaryRestrictions || 'None',
            })
        ]);

        return {
            success: true,
            data: {
                diseases: diseasePrediction.possibleDiseases,
                medications: {
                    suggestions: medicationSuggestion.medicationSuggestions,
                    disclaimer: medicationSuggestion.disclaimer
                },
                dietChart: dietChartData.dietChart,
            }
        };
    } catch (error) {
        console.error("Error in getHealthAnalysis:", error);
        return { success: false, error: 'An AI-related error occurred. Please check your inputs and try again.' };
    }
}
