import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-diet-charts.ts';
import '@/ai/flows/predict-possible-diseases.ts';
import '@/ai/flows/suggest-appropriate-medications.ts';