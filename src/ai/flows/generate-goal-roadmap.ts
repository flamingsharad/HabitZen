
'use server';

/**
 * @fileOverview An AI agent that breaks down a user's goal into a roadmap of actionable micro-habits.
 *
 * - generateGoalRoadmap - A function that returns a list of suggested micro-habits.
 * - GenerateGoalRoadmapInput - The input type for the generateGoalRoadmap function.
 * - GenerateGoalRoadmapOutput - The return type for the generateGoalRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGoalRoadmapInputSchema = z.object({
  goal: z.string().describe('The high-level goal the user wants to achieve.'),
});

export type GenerateGoalRoadmapInput = z.infer<
  typeof GenerateGoalRoadmapInputSchema
>;

const MicroHabitSchema = z.object({
  habitName: z.string().describe('A small, concrete, and actionable micro-habit.'),
  category: z.enum(['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Productivity', 'Other']).describe('The most appropriate category for this micro-habit.'),
  reasoning: z.string().describe('A brief explanation of how this micro-habit contributes to the overall goal.'),
});

const GenerateGoalRoadmapOutputSchema = z.object({
  roadmap: z
    .array(MicroHabitSchema)
    .describe('A list of 3-5 micro-habits that break down the main goal.'),
});

export type GenerateGoalRoadmapOutput = z.infer<
  typeof GenerateGoalRoadmapOutputSchema
>;
export type MicroHabit = z.infer<typeof MicroHabitSchema>;


export async function generateGoalRoadmap(
  input: GenerateGoalRoadmapInput
): Promise<GenerateGoalRoadmapOutput> {
  return generateGoalRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGoalRoadmapPrompt',
  input: {schema: GenerateGoalRoadmapInputSchema},
  output: {schema: GenerateGoalRoadmapOutputSchema},
  prompt: `You are a productivity expert who excels at breaking down large, ambitious goals into small, manageable, and actionable micro-habits.

  The user wants to achieve the following goal: {{{goal}}}

  Your task is to generate a roadmap of 3-5 specific micro-habits that will help the user make consistent progress towards their goal. For each micro-habit, provide a clear name, a relevant category, and a concise reason why it is a good step.

  Focus on creating habits that are easy to start and can be completed in a short amount of time (e.g., "Read one page of a book" instead of "Read a book").
  `,
});

const generateGoalRoadmapFlow = ai.defineFlow(
  {
    name: 'generateGoalRoadmapFlow',
    inputSchema: GenerateGoalRoadmapInputSchema,
    outputSchema: GenerateGoalRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
