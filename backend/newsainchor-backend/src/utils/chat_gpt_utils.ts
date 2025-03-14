// This file contains utility functions for interacting with the OpenAI GPT-4o-mini model
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const MODEL = 'gpt-4o-mini';
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Helper function to wait
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Pass in the news article and get a summary for it
export async function summarizeText(apiKey: string, text: string): Promise<string | undefined> {
	const openai = new OpenAI({
		apiKey: apiKey,
	});
	let attempts = 0;
	let lastError: any;

	while (attempts < MAX_RETRIES) {
		try {
			const completion = await openai.chat.completions.create({
				model: MODEL,
				messages: [{ role: 'user', content: `Summarize the following news article from today (ignore any HTML artifacts): ${text}` }],
			});

			const content = completion.choices[0].message.content;
			if (content === null) {
				throw new Error('Received null content from OpenAI');
			}
			return content;
		} catch (error: any) {
			attempts++;
			lastError = error;
			console.error(`Attempt ${attempts} failed:`, {
				error: error.message,
				status: error.status,
				type: error.type,
			});

			if (attempts < MAX_RETRIES) {
				await delay(RETRY_DELAY * attempts); // Exponential backoff
				continue;
			}

			console.error(`Failed to summarize after ${attempts} attempts. Last error:`, lastError);
			throw new Error(`Failed to summarize text after ${attempts} attempts: ${lastError.message}`);
		}
	}
}

// Pass in all the summaries and get a news anchor script to pass to Tavus
export async function generateAnchorScript(
	apiKey: string,
	texts: Array<{ summary: string; isPolitical: boolean }> | string[],
	date: string,
): Promise<string> {
	const openai = new OpenAI({
		apiKey: apiKey,
	});
	let attempts = 0;
	let lastError: any;

	while (attempts < MAX_RETRIES) {
		try {
			let combinedText;
			let isPoliticalArray = [];

			// Handle both the new flagged format and the old string array format for backward compatibility
			if (typeof texts[0] === 'string') {
				// Old format - just strings
				combinedText = (texts as string[]).map((text, index) => `Article ${index + 1}: ${text}`).join('\n');
				isPoliticalArray = Array(texts.length).fill(false);
			} else {
				// New format with political flags
				combinedText = (texts as Array<{ summary: string; isPolitical: boolean }>)
					.map((item, index) => `Article ${index + 1}: ${item.summary}`)
					.join('\n');
				isPoliticalArray = (texts as Array<{ summary: string; isPolitical: boolean }>).map((item) => item.isPolitical);
			}

			// Create indicators for which articles are political
			const politicalInfo = isPoliticalArray
				.map((isPol, idx) => (isPol ? `Article ${idx + 1} is POLITICAL. Use a serious tone without humor for this segment.` : ''))
				.filter(Boolean)
				.join('\n');

			const completion = await openai.chat.completions.create({
				model: MODEL,
				messages: [
					{
						role: 'system',
						content: `You are a news anchor script generator. When given a date in DD-MM-YYYY format, you must interpret it as: DD is the day, MM is the month number (01-12), and YYYY is the year. For example, "02-03-2025" means March 2nd, 2025 (not February 3rd). Always convert the month number to its name when speaking the date.`,
					},
					{
						role: 'user',
						content: `Generate a news anchor script for a one minute tik-tok style video for an app called NewsAInchor. Make each section short. During the introduction, say the date as a spoken date. For example, if the date is "02-03-2025", you must say "March 2nd, 2025" (not February 3rd). The date to use is: ${date}.

${politicalInfo ? `IMPORTANT: Some articles are political in nature:\n${politicalInfo}\n\nFor political articles, DO NOT use humor or jokes - maintain a serious, professional tone. For non-political articles, you may use humor.` : 'Use some humor when appropriate.'}

Do not include any stage directions or segment headers or any flairs in the text like asterisks. The script should be based on the following articles:

${combinedText}`,
					},
				],
			});

			const content = completion.choices[0].message.content;
			if (content === null) {
				throw new Error('Received null content from OpenAI');
			}
			return content;
		} catch (error: any) {
			attempts++;
			lastError = error;
			console.error(`Attempt ${attempts} failed to generate anchor script:`, {
				error: error.message,
				status: error.status,
				type: error.type,
			});

			if (attempts < MAX_RETRIES) {
				await delay(RETRY_DELAY * attempts); // Exponential backoff
				continue;
			}

			console.error(`Failed to generate anchor script after ${attempts} attempts. Last error:`, lastError);
			throw new Error(`Failed to generate anchor script after ${attempts} attempts: ${lastError.message}`);
		}
	}
	return ''; // This line should never be reached due to the throw in the catch block
}
