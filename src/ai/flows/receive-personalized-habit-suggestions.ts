'use server';

/**
 * @fileOverview Provides AI-driven habit recommendations tailored to user goals and progress.
 *
 * - receivePersonalizedHabitSuggestions - A function that returns habit recommendations.
 * - PersonalizedHabitSuggestionsInput - The input type for the receivePersonalizedHabitSuggestions function.
 * - PersonalizedHabitSuggestionsOutput - The return type for the receivePersonalizedHabitSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHabitSuggestionsInputSchema = z.object({
  userGoals: z.string().describe('The user goals and aspirations.'),
  userProgress: z
    .string()
    .describe(
      'A summary of the user progress, including successful habits, challenges, and consistency percentage.'
    ),
  userPrompt: z
    .string()
    .describe(
      'A user-provided prompt describing what they want to achieve or what kind of habits they are looking for.'
    ),
});

export type PersonalizedHabitSuggestionsInput = z.infer<
  typeof PersonalizedHabitSuggestionsInputSchema
>;

const SuggestedHabitSchema = z.object({
  habitName: z.string().describe('The name of the suggested habit.'),
  category: z.enum(['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Productivity', 'Other']).describe('The most appropriate category for this habit.'),
  reasoning: z.string().describe('A brief explanation of why this habit is being recommended, tied to the user\'s goals.'),
});

const PersonalizedHabitSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestedHabitSchema).describe('A list of 3 to 5 habit suggestions.'),
});


export type PersonalizedHabitSuggestionsOutput = z.infer<
  typeof PersonalizedHabitSuggestionsOutputSchema
>;
export type SuggestedHabit = z.infer<typeof SuggestedHabitSchema>;

export async function receivePersonalizedHabitSuggestions(
  input: PersonalizedHabitSuggestionsInput
): Promise<PersonalizedHabitSuggestionsOutput> {
  return personalizedHabitSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHabitSuggestionsPrompt',
  input: {schema: PersonalizedHabitSuggestionsInputSchema},
  output: {schema: PersonalizedHabitSuggestionsOutputSchema},
  prompt: `You are an AI habit coach who specializes in recommending habits to users based on their goals and progress.

  Based on the user's stated goals, their current progress and challenges, and the prompt they have provided, suggest 3-5 new habits the user may want to incorporate into their daily life.

  User Goals: {{{userGoals}}}
  User Progress: {{{userProgress}}}
  User Prompt: {{{userPrompt}}}

  Provide specific habit suggestions, a relevant category for each, and explain why each habit would be helpful for achieving their goals.
`,
});

const personalizedHabitSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedHabitSuggestionsFlow',
    inputSchema: PersonalizedHabitSuggestionsInputSchema,
    outputSchema: PersonalizedHabitSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
