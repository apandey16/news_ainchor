// This file contains utility functions for interacting with the OpenAI GPT-4o-mini model
// To-do: Once hosted on AWS, move this to the lambda package and install needed dependencies. Also update API key
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const CHAT_API_KEY = process.env.CHAT_API_KEY;
const MODEL = 'gpt-4o-mini';

const openai = new OpenAI({
	apiKey: CHAT_API_KEY,
});

// Pass in the news article and get a summary for it
export async function summarizeText(text: string): Promise<string> {
	try {
		const completion = await openai.chat.completions.create({
			model: MODEL,
			messages: [
				{ role: 'user', content: `Summarize the following news articles from today(ignore any HTML artifacts): ${text}` },
			],
		});

		const content = completion.choices[0].message.content;
		if (content === null) {
			throw new Error('Received null content from OpenAI');
		}
		return content;
	} catch (error) {
		console.error('Error summarizing text:', error);
		throw new Error('Failed to summarize text');
	}
}

// Pass in all the summaries and get a news anchor script to pass to Tavus
export async function generateAnchorScript(texts: string[]): Promise<string> {
	try {
		const combinedText = texts.join(' ');
		const completion = await openai.chat.completions.create({
			model: MODEL,
			messages: [
				{
					role: 'user',
					content: `Generate a news anchor script based on the following texts: ${combinedText}`,
				},
			],
		});

		const content = completion.choices[0].message.content;
		if (content === null) {
			throw new Error('Received null content from OpenAI');
		}
		return content;
	} catch (error) {
		console.error('Error generating anchor script:', error);
		throw new Error('Failed to generate anchor script');
	}
}
