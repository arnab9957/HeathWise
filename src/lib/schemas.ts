import * as z from 'zod';

export const healthFormSchema = z.object({
  symptoms: z.string().min(3, { message: 'Please enter at least one symptom.' }),
  age: z.coerce.number().int().min(1, { message: 'Age must be at least 1.' }).max(120, { message: 'Age must be 120 or less.' }),
  gender: z.enum(['male', 'female'], { required_error: 'Please select a gender.' }),
  weight: z.coerce.number().min(1, { message: 'Weight must be a positive number.' }),
  height: z.coerce.number().min(1, { message: 'Height must be a positive number.' }),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'], { required_error: 'Please select an activity level.' }),
  dietaryRestrictions: z.string().optional(),
}).refine(data => {
    (data.age as unknown) = String(data.age);
    (data.weight as unknown) = String(data.weight);
    (data.height as unknown) = String(data.height);
    return true;
});

export type HealthFormData = z.infer<typeof healthFormSchema>;

export type AnalysisResult = {
    diseases: string[];
    medications: {
        suggestions: string;
        disclaimer: string;
    };
    dietChart: string;
};
