
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const DATASET_DIR = path.join(process.cwd(), 'docs', 'medicine-recommendation-system-dataset');

async function main() {
    console.log('Starting dataset generation...');

    // 1. Read Training.csv to get Disease -> Symptoms mapping
    // It's a 0/1 matrix. Columns are symptoms, last column is prognosis (Disease).
    const trainingPath = path.join(DATASET_DIR, 'Training.csv');
    const trainingContent = fs.readFileSync(trainingPath, 'utf-8');
    const trainingRecords = parse(trainingContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    }) as any[];

    const diseaseToSymptoms: Record<string, Set<string>> = {};

    // Get all symptom names (keys excluding 'prognosis')
    const symptomKeys = Object.keys(trainingRecords[0]).filter(k => k !== 'prognosis');

    console.log(`Found ${symptomKeys.length} symptom columns.`);

    for (const record of trainingRecords) {
        const disease = record.prognosis;
        if (!diseaseToSymptoms[disease]) {
            diseaseToSymptoms[disease] = new Set();
        }

        for (const symptom of symptomKeys) {
            if (record[symptom] === '1') {
                diseaseToSymptoms[disease].add(symptom);
            }
        }
    }

    // 2. Read Description
    const descPath = path.join(DATASET_DIR, 'description.csv');
    const descRecords = parse(fs.readFileSync(descPath, 'utf-8'), { columns: true, skip_empty_lines: true }) as any[];
    const diseaseToDesc: Record<string, string> = {};
    for (const r of descRecords) {
        diseaseToDesc[r.Disease.trim()] = r.Description;
    }

    // 3. Read Medications
    const medPath = path.join(DATASET_DIR, 'medications.csv');
    const medRecords = parse(fs.readFileSync(medPath, 'utf-8'), { columns: true, skip_empty_lines: true }) as any[];
    const diseaseToMeds: Record<string, string> = {};
    for (const r of medRecords) {
        diseaseToMeds[r.Disease.trim()] = r.Medication;
    }

    // 4. Read Diets
    const dietPath = path.join(DATASET_DIR, 'diets.csv');
    const dietRecords = parse(fs.readFileSync(dietPath, 'utf-8'), { columns: true, skip_empty_lines: true }) as any[];
    const diseaseToDiet: Record<string, string> = {};
    for (const r of dietRecords) {
        diseaseToDiet[r.Disease.trim()] = r.Diet;
    }

    // 5. Read Workout
    // Headers: ,Unnamed: 0,disease,workout
    const workPath = path.join(DATASET_DIR, 'workout_df.csv');
    const workRecords = parse(fs.readFileSync(workPath, 'utf-8'), { columns: true, skip_empty_lines: true }) as any[];
    const diseaseToWorkout: Record<string, string> = {};
    for (const r of workRecords) {
        // disease column might be 'disease'
        const name = r.disease?.trim();
        if (name) {
            diseaseToWorkout[name] = r.workout;
        }
    }

    // 6. Read Precautions
    // Headers: ,Disease,Precaution_1,Precaution_2,Precaution_3,Precaution_4
    const precPath = path.join(DATASET_DIR, 'precautions_df.csv');
    const precRecords = parse(fs.readFileSync(precPath, 'utf-8'), { columns: true, skip_empty_lines: true }) as any[];
    const diseaseToPrec: Record<string, string> = {};
    for (const r of precRecords) {
        const name = r.Disease?.trim();
        if (name) {
            const precs = [r.Precaution_1, r.Precaution_2, r.Precaution_3, r.Precaution_4]
                .filter(p => p && p.trim())
                .join(', ');
            diseaseToPrec[name] = precs;
        }
    }

    // 7. Merge and Write
    const mergedRows = [];
    const allDiseases = Object.keys(diseaseToSymptoms);

    for (const disease of allDiseases) {
        // Normalizing keys for lookup (some files might have spaces or case diffs? handled mostly by trim())
        // Note: 'Peptic ulcer diseae' in Training.csv vs 'Peptic ulcer disease' (with s) in others.
        // We might need fuzzy match or manual fix. For now, strict match.

        // Attempt to fix common known typo
        let lookupName = disease;
        if (disease === 'Peptic ulcer diseae') lookupName = 'Peptic ulcer disease';
        if (disease === 'Dimorphic hemmorhoids(piles)') lookupName = 'Dimorphic hemmorhoids(piles)'; // Seems same
        // Check capitalization diffs?
        // 'Diabetes ' in Training vs 'Diabetes' in description (trailing space? handled by trim)

        // Actually, let's normalize keys by trimming and lowercasing for lookup map construction?
        // No, let's just rely on exact string match first.

        // We need to look up in the maps.
        // The maps were built with .trim().
        // The disease from Training needs .trim().

        const cleanDisease = disease.trim();
        let lookup = cleanDisease;
        if (lookup === 'Peptic ulcer diseae') lookup = 'Peptic ulcer disease';

        mergedRows.push({
            Disease: cleanDisease,
            Symptoms: Array.from(diseaseToSymptoms[disease]).join(', '),
            Description: diseaseToDesc[lookup] || '',
            Medication: diseaseToMeds[lookup] || '',
            Diets: diseaseToDiet[lookup] || '',
            Workout: diseaseToWorkout[lookup] || '',
            Precautions: diseaseToPrec[lookup] || ''
        });
    }


    // 8. Read Supplemental Data
    const suppPath = path.join(DATASET_DIR, 'supplemental_data.csv');
    if (fs.existsSync(suppPath)) {
        console.log('Found supplemental_data.csv, merging...');
        const suppContent = fs.readFileSync(suppPath, 'utf-8');
        const suppRecords = parse(suppContent, { columns: true, skip_empty_lines: true }) as any[];

        for (const r of suppRecords) {
            mergedRows.push({
                Disease: r.Disease,
                Symptoms: r.Symptoms, // Already comma-separated string in CSV
                Description: r.Description,
                Medication: r.Medication,
                Diets: r.Diets,
                Workout: r.Workout,
                Precautions: r.Precautions
            });
            // Also add these symptoms to our symptoms list for the AI
            const rowSymptoms = r.Symptoms.split(',').map((s: string) => s.trim());
            for (const s of rowSymptoms) {
                if (!symptomKeys.includes(s)) {
                    symptomKeys.push(s);
                }
            }
        }
    }

    const outputContent = stringify(mergedRows, { header: true });
    fs.writeFileSync(path.join(DATASET_DIR, 'dataset.csv'), outputContent);
    console.log(`Generated dataset.csv with ${mergedRows.length} rows.`);

    // Also write the symptoms list to a JSON file for the AI
    const allSymptoms = symptomKeys;
    fs.writeFileSync(
        path.join(process.cwd(), 'src', 'lib', 'symptoms_list.json'),
        JSON.stringify(allSymptoms, null, 2)
    );
    console.log('Written symptoms_list.json');
}

main().catch(console.error);
