/**
 * @fileOverview Service for reading and searching the health dataset.
 *
 * - searchHealthData - Searches the dataset for records matching a list of symptoms.
 */

import fs from 'fs';
import path from 'path';

// Define the structure of a row in our dataset
type HealthDataRow = {
  Disease: string;
  Description: string;
  Medication: string;
  Diets: string;
  Workout: string;
  Precautions: string;
  Symptoms: string;
};

// A simple in-memory cache for the dataset
let healthDataCache: HealthDataRow[] | null = null;

/**
 * Loads and parses the dataset from the CSV file.
 * Caches the data in memory to avoid repeated file reads.
 * @returns {Promise<HealthDataRow[]>} A promise that resolves to an array of data rows.
 */
async function loadHealthData(): Promise<HealthDataRow[]> {
  if (healthDataCache) {
    return healthDataCache;
  }

  // NOTE: This assumes a file named 'dataset.csv' exists in the specified directory.
  // Please ensure your file is named correctly.
  const filePath = path.join(process.cwd(), 'docs', 'medicine-recommendation-system-dataset', 'dataset.csv');
  
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    
    // Simple CSV parser
    const rows = fileContent.split('\n').filter(row => row.trim() !== '');
    const headers = rows[0].split(',').map(h => h.trim());
    const data = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const entry: any = {};
        headers.forEach((header, index) => {
            entry[header] = values[index];
        });
        return entry as HealthDataRow;
    });

    healthDataCache = data;
    return data;
  } catch (error) {
    console.error("Failed to read or parse the dataset file:", error);
    // Return empty array if file is not found or fails to parse
    return [];
  }
}

/**
 * Searches the health dataset for entries that match any of the provided symptoms.
 * @param {string[]} symptoms - An array of symptoms to search for.
 * @returns {Promise<any[]>} A promise that resolves to an array of matching records.
 */
export async function searchHealthData(symptoms: string[]): Promise<any[]> {
  const data = await loadHealthData();
  if (data.length === 0) {
      return [];
  }

  const lowercasedSymptoms = symptoms.map(s => s.toLowerCase());

  const results = data.filter(row => {
    const rowSymptoms = row.Symptoms.toLowerCase().split(',').map(s => s.trim());
    return lowercasedSymptoms.some(userSymptom => rowSymptoms.includes(userSymptom));
  });

  // Map to the format expected by the AI tool
  return results.map(row => ({
      disease: row.Disease,
      description: row.Description,
      medication: row.Medication,
      diets: row.Diets,
      workout: row.Workout,
      precaution: row.Precautions
  }));
}
