
'use server';

/**
 * @fileOverview An AI agent that suggests habit stacks based on a user's existing habits.
 *
 * - getHabitStackingSuggestions - A function that returns habit stacking recommendations.
 * - HabitStackingSuggestionsInput - The input type for the getHabitStackingSuggestions function.
 * - HabitStackingSuggestionsOutput - The return type for the getHabitStackingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HabitStackingSuggestionsInputSchema = z.object({
  habits: z
    .string()
    .describe('A stringified JSON array of the user\'s current habits.'),
  dailyRoutine: z
    .string()
    .optional()
    .describe("The user's preferred daily routine style ('morning' or 'night')."),
});

export type HabitStackingSuggestionsInput = z.infer<
  typeof HabitStackingSuggestionsInputSchema
>;

const HabitStackSchema = z.object({
  baseHabitName: z
    .string()
    .describe('The name of the existing habit that will act as a trigger.'),
  newHabitName: z
    .string()
    .describe('The name of the new habit to perform after the base habit.'),
  category: z.enum(['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Productivity', 'Other']).describe('The category for the new habit.'),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of why this habit stack is beneficial for the user.'
    ),
});

const HabitStackingSuggestionsOutputSchema = z.object({
  stacks: z
    .array(HabitStackSchema)
    .describe('A list of 2-3 habit stacking suggestions.'),
});

export type HabitStackingSuggestionsOutput = z.infer<
  typeof HabitStackingSuggestionsOutputSchema
>;
export type SuggestedHabitStack = z.infer<typeof HabitStackSchema>;

export async function getHabitStackingSuggestions(
  input: HabitStackingSuggestionsInput
): Promise<HabitStackingSuggestionsOutput> {
  return habitStackingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'habitStackingSuggestionsPrompt',
  input: {schema: HabitStackingSuggestionsInputSchema},
  output: {schema: HabitStackingSuggestionsOutputSchema},
  prompt: `You are an expert productivity coach specializing in the "habit stacking" method. Your goal is to help users build new routines by chaining new habits to existing ones.

  Based on the user's current habits and their daily routine preference, suggest 2-3 new habit stacks. A habit stack follows the formula: "After [Current Habit], I will [New Habit]".

  User's Habits: {{{habits}}}
  User's Routine: {{{dailyRoutine}}}

  For each suggestion, provide the base habit, the new habit to stack on top of it, a category for the new habit, and a compelling reason why this combination is effective. Focus on creating logical and beneficial pairings. For example, stack "Meditate for 5 minutes" after "Drink morning coffee," not after "Go for a run."
  `,
});

const habitStackingSuggestionsFlow = ai.defineFlow(
  {
    name: 'habitStackingSuggestionsFlow',
    inputSchema: HabitStackingSuggestionsInputSchema,
    outputSchema: HabitStackingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
