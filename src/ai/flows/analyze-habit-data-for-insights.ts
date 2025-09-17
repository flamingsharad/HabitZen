'use server';
/**
 * @fileOverview An AI agent that analyzes habit data to provide insights.
 *
 * - analyzeHabitDataForInsights - A function that analyzes habit data and provides insights.
 * - AnalyzeHabitDataInput - The input type for the analyzeHabitDataForInsights function.
 * - AnalyzeHabitDataOutput - The return type for the analyzeHabitDataForInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHabitDataInputSchema = z.object({
  habitData: z
    .string()
    .describe(
      'A stringified JSON array containing the user habit data, including habit name, completion status, and date.'
    ),
    moodData: z
    .string()
    .describe(
      'A stringified JSON array of the user\'s mood logs, including mood and date.'
    ),
  userGoals: z.string().describe('The user goals to achieve.'),
});
export type AnalyzeHabitDataInput = z.infer<typeof AnalyzeHabitDataInputSchema>;

const AnalyzeHabitDataOutputSchema = z.object({
  consistencyPercentage: z
    .number()
    .describe('The consistency percentage of the user completing their habits.'),
  bestPerformingDays: z
    .string()
    .describe('The days of the week when the user performs best.'),
  weakAreas: z
    .string()
    .describe('The habits or areas where the user is struggling.'),
  crossAnalysis: z
    .string()
    .describe(
      'An insight from correlating habit completion with mood data. e.g., "When you do X, you feel Y."'
    ),
  advice: z
    .string()
    .describe(
      'Personalized advice for the user to improve their habit consistency and achieve their goals.'
    ),
});
export type AnalyzeHabitDataOutput = z.infer<typeof AnalyzeHabitDataOutputSchema>;

export async function analyzeHabitDataForInsights(
  input: AnalyzeHabitDataInput
): Promise<AnalyzeHabitDataOutput> {
  return analyzeHabitDataForInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeHabitDataForInsightsPrompt',
  input: {schema: AnalyzeHabitDataInputSchema},
  output: {schema: AnalyzeHabitDataOutputSchema},
  prompt: `You are an AI assistant designed to analyze user habit data and provide insights to help them achieve their goals.

  Analyze the following habit data and mood data to determine the user's consistency, best performing days, and weak areas.
  
  Most importantly, find a correlation between completing a specific habit and the user's mood on those same days. This is the cross-analysis. For example: "On days you completed 'Exercise', your mood was more likely to be 'Happy'." If no clear correlation exists, state that.

  Provide personalized advice to help the user improve their habits and achieve their goals.

  Habit Data: {{{habitData}}}
  Mood Data: {{{moodData}}}
  User Goals: {{{userGoals}}}
`,
});

const analyzeHabitDataForInsightsFlow = ai.defineFlow(
  {
    name: 'analyzeHabitDataForInsightsFlow',
    inputSchema: AnalyzeHabitDataInputSchema,
    outputSchema: AnalyzeHabitDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
