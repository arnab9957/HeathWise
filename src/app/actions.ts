'use server';

import type { HealthFormData, AnalysisResult } from '@/lib/schemas';
import { predictPossibleDiseases } from '@/ai/flows/predict-possible-diseases';
import { suggestAppropriateMedications } from '@/ai/flows/suggest-appropriate-medications';
import { generatePersonalizedDietChart } from '@/ai/flows/generate-personalized-diet-charts';
import { initWandb, logMetrics, finishRun } from '@/lib/wandb';

export async function getHealthAnalysis(data: HealthFormData): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
    try {
        await initWandb();
        const startTime = Date.now();
        console.log('Starting health analysis...');

        const symptomsArray = data.symptoms.split(',').map(s => s.trim()).filter(s => s);
        if (symptomsArray.length === 0) {
            logMetrics({ event: 'validation_error', error: 'No symptoms provided' });
            await finishRun();
            return { success: false, error: 'Please provide at least one symptom.' };
        }

        const diseasePrediction = await predictPossibleDiseases({ symptoms: symptomsArray });
        const predictedDisease = diseasePrediction.possibleDiseases[0] || 'general wellness';

        const patientProfile = `Age: ${data.age}, Gender: ${data.gender}, Weight: ${data.weight}kg, Height: ${data.height}cm. Activity Level: ${data.activityLevel.replace(/_/g, ' ')}. Dietary Restrictions: ${data.dietaryRestrictions || 'None'}.`;

        const [medicationSuggestion, dietChartData] = await Promise.all([
            suggestAppropriateMedications({
                predictedDisease,
                patientProfile,
                symptoms: symptomsArray,
            }),
            generatePersonalizedDietChart({
                predictedCondition: predictedDisease,
                age: data.age,
                gender: data.gender,
                weight: data.weight,
                height: data.height,
                symptoms: symptomsArray,
                activityLevel: data.activityLevel.replace(/_/g, ' '),
                dietaryRestrictions: data.dietaryRestrictions || 'None',
            })
        ]);

        // Log successful run metrics
        logMetrics({
            event: 'health_analysis_success',
            duration_ms: Date.now() - startTime,
            age: data.age,
            gender: data.gender,
            symptoms_count: symptomsArray.length,
            predicted_disease: predictedDisease,
            diseases_found: diseasePrediction.possibleDiseases.length
        });
        await finishRun();

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

        logMetrics({ event: 'health_analysis_error', error: String(error) });
        await finishRun();
        return { success: false, error: 'An AI-related error occurred. Please check your inputs and try again.' };
    }
}
