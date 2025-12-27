"use client";

import Image from 'next/image';

import { useState } from 'react';
import type { AnalysisResult, HealthFormData } from '@/lib/schemas';
import { getHealthAnalysis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { HealthForm } from '@/components/health-form';
import { ResultsDisplay } from '@/components/results-display';
import { Loader2, Stethoscope } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: HealthFormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    const result = await getHealthAnalysis(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setAnalysisResult(result.data);
      // scroll to results
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast({
        title: "Analysis Failed",
        description: result.error || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="absolute top-4 right-4 z-10">
        <UserButton />
      </div>
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="HealthWise Logo"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">HealthWise</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your intelligent health companion. Enter your symptoms and personal details to get AI-powered insights into your health.
          </p>
        </header>

        <HealthForm onSubmit={handleFormSubmit} isLoading={isLoading} />

        {isLoading && (
          <div className="flex justify-center items-center mt-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Analyzing your health data...</p>
          </div>
        )}

        {analysisResult && (
          <div id="results" className="mt-12">
            <ResultsDisplay results={analysisResult} />
          </div>
        )}

      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Disclaimer: HealthWise provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.</p>
      </footer>
    </div>
  );
}
