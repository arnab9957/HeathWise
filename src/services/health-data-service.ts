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
 * Parses a single line of CSV.
 * Handles quoted fields that may contain commas.
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim());
    return result;
}


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
    
    const rows = fileContent.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) {
        return []; // Not enough data
    }

    const headers = parseCsvLine(rows[0]).map(h => h.trim());
    
    const data = rows.slice(1).map(row => {
        const values = parseCsvLine(row);
        const entry: any = {};
        headers.forEach((header, index) => {
            entry[header] = values[index] || '';
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

  const lowercasedSymptoms = symptoms.map(s => s.toLowerCase().trim());
  const matchedDiseases = new Set<string>();
  const results: any[] = [];

  data.forEach(row => {
    // Prevent duplicates
    if (matchedDiseases.has(row.Disease)) {
        return;
    }

    const rowSymptoms = (row.Symptoms || '').toLowerCase().split(',').map(s => s.trim());
    const isMatch = lowercasedSymptoms.some(userSymptom => rowSymptoms.includes(userSymptom));
    
    if (isMatch) {
      results.push({
          disease: row.Disease,
          description: row.Description,
          medication: row.Medication,
          diets: row.Diets,
          workout: row.Workout,
          precaution: row.Precautions
      });
      matchedDiseases.add(row.Disease);
    }
  });

  return results;
}