"use client"

import type { AnalysisResult } from "@/lib/schemas"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Pill, Salad, Stethoscope } from "lucide-react"
import ReactMarkdown from "react-markdown"

const MarkdownDisplay = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      className="prose prose-sm dark:prose-invert max-w-none"
      components={{
        h3: ({ node, ...props }) => <h3 className="font-bold font-headline text-xl text-primary mt-6 first:mt-0 border-b pb-2" {...props} />,
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2" {...props} />,
        li: ({ node, ...props }) => <li className="pl-2" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export function ResultsDisplay({ results }: AnalysisResult) {
  return (
    <Card className="shadow-lg animate-in fade-in-0 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Your Health Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prediction" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10">
            <TabsTrigger value="prediction"><Stethoscope className="mr-2" /> Disease Prediction</TabsTrigger>
            <TabsTrigger value="medication"><Pill className="mr-2" /> Medication Suggestions</TabsTrigger>
            <TabsTrigger value="diet"><Salad className="mr-2" /> Personalized Diet Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="prediction" className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Possible Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {results.diseases.length > 0 ? (
                results.diseases.map((disease, index) => (
                  <Badge key={index} variant="secondary" className="text-base px-3 py-1">{disease}</Badge>
                ))
              ) : (
                <p>No specific conditions identified based on symptoms.</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">These are potential conditions based on the symptoms provided and are not a formal diagnosis.</p>
          </TabsContent>
          
          <TabsContent value="medication" className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Suggested Medications</h3>
              <MarkdownDisplay content={results.medications.suggestions} />
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start text-amber-800">
                <AlertCircle className="w-5 h-5 mr-3 mt-1 shrink-0" />
                <div>
                    <h4 className="font-semibold">Disclaimer</h4>
                    <p className="text-sm">{results.medications.disclaimer}</p>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="diet" className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Your Weekly Diet Plan</h3>
            <MarkdownDisplay content={results.dietChart} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
