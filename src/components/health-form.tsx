"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { healthFormSchema, type HealthFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type HealthFormProps = {
  onSubmit: (data: HealthFormData) => void;
  isLoading: boolean;
};

export function HealthForm({ onSubmit, isLoading }: HealthFormProps) {
  const form = useForm<HealthFormData>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: {
      symptoms: "",
      age: 30,
      gender: "male",
      weight: 70,
      height: 175,
      activityLevel: "moderately_active",
      dietaryRestrictions: "",
    },
  });

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Your Health Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., headache, fever, cough"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please list your symptoms, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} value={String(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="70" {...field} value={String(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="175" {...field} value={String(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (light exercise/sports 1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (moderate exercise/sports 3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (hard exercise/sports 6-7 days a week)</SelectItem>
                      <SelectItem value="extra_active">Extra Active (very hard exercise/sports & physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., vegetarian, gluten-free, nut allergy"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    List any dietary restrictions or allergies you have.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
              {isLoading ? "Analyzing..." : "Get Health Analysis"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
