'use server';

/**
 * @fileOverview Category suggestion AI agent.
 *
 * - suggestPostCategory - A function that suggests categories for a given post.
 * - SuggestPostCategoryInput - The input type for the suggestPostCategory function.
 * - SuggestPostCategoryOutput - The return type for the suggestPostCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPostCategoryInputSchema = z.object({
  text: z
    .string()
    .describe("The text content of the post for which to suggest categories."),
});
export type SuggestPostCategoryInput = z.infer<typeof SuggestPostCategoryInputSchema>;

const SuggestPostCategoryOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe("An array of suggested categories for the post."),
});
export type SuggestPostCategoryOutput = z.infer<typeof SuggestPostCategoryOutputSchema>;

export async function suggestPostCategory(input: SuggestPostCategoryInput): Promise<SuggestPostCategoryOutput> {
  return suggestPostCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPostCategoryPrompt',
  input: {schema: SuggestPostCategoryInputSchema},
  output: {schema: SuggestPostCategoryOutputSchema},
  prompt: `Suggest relevant categories for the following post content.  Return a JSON array of strings.

Content: {{{text}}}`,
});

const suggestPostCategoryFlow = ai.defineFlow(
  {
    name: 'suggestPostCategoryFlow',
    inputSchema: SuggestPostCategoryInputSchema,
    outputSchema: SuggestPostCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
