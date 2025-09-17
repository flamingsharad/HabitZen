
'use server';

/**
 * @fileOverview An AI agent that forecasts the time required to form a habit.
 *
 * - forecastHabitFormation - A function that predicts how many days it will take for a habit to become automatic.
 * - ForecastHabitFormationInput - The input type for the forecastHabitFormation function.
 * - ForecastHabitFormationOutput - The return type for the forecastHabitFormation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastHabitFormationInputSchema = z.object({
  habitName: z.string().describe('The name of the habit being analyzed.'),
  habitHistory: z
    .string()
    .describe(
      'A stringified JSON object containing the habit\'s logs, current streak, and frequency.'
    ),
  consistency: z
    .number()
    .describe('The overall completion percentage for the habit.'),
});

export type ForecastHabitFormationInput = z.infer<
  typeof ForecastHabitFormationInputSchema
>;

const ForecastHabitFormationOutputSchema = z.object({
  daysRemaining: z
    .number()
    .describe(
      'The predicted number of additional days of consistent practice required to form the habit.'
    ),
  confidence: z
    .enum(['High', 'Medium', 'Low'])
    .describe(
      'The confidence level in the prediction, based on the amount and consistency of data.'
    ),
  message: z
    .string()
    .describe(
      'An encouraging and personalized message to the user about their progress and the forecast.'
    ),
});

export type ForecastHabitFormationOutput = z.infer<
  typeof ForecastHabitFormationOutputSchema
>;

export async function forecastHabitFormation(
  input: ForecastHabitFormationInput
): Promise<ForecastHabitFormationOutput> {
  return forecastHabitFormationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastHabitFormationPrompt',
  input: {schema: ForecastHabitFormationInputSchema},
  output: {schema: ForecastHabitFormationOutputSchema},
  prompt: `You are a behavioral psychologist and data scientist who specializes in habit formation. Your task is to predict how long it will take for a user to form a specific habit.

  The common wisdom is that it takes about 66 days of consistent practice to form a habit, but this varies based on consistency.
  
  Analyze the following habit data:
  - Habit: {{{habitName}}}
  - History (logs, streak, frequency): {{{habitHistory}}}
  - Overall Consistency: {{{consistency}}}%

  Based on this data, predict the number of *additional* days the user needs to practice consistently to make this habit automatic. A user with high consistency and a long streak will need fewer days than a new or inconsistent user. A brand new habit should take around 66 days.

  Provide a confidence level (High, Medium, Low) for your prediction. Confidence is high if there's a lot of consistent data. Confidence is low if the data is sparse or very inconsistent.

  Finally, provide a short, personalized, and encouraging message to the user.
  `,
});

const forecastHabitFormationFlow = ai.defineFlow(
  {
    name: 'forecastHabitFormationFlow',
    inputSchema: ForecastHabitFormationInputSchema,
    outputSchema: ForecastHabitFormationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
