// This file contains utility functions for interacting with the OpenAI GPT-4o-mini model
// To-do: Once hosted on AWS, move this to the lambda package and install needed dependencies. Also update API key
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const MODEL = 'gpt-4o-mini';

// Pass in the news article and get a summary for it
export async function summarizeText(apiKey:string, text: string): Promise<string> {
	try {
		const openai = new OpenAI({
			apiKey: apiKey,
		});
		const completion = await openai.chat.completions.create({
			model: MODEL,
			messages: [
				{ role: 'user', content: `Summarize the following news article from today (ignore any HTML artifacts): ${text}` },
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
export async function generateAnchorScript(apiKey: string, texts: string[]): Promise<string> {
	try {
		const openai = new OpenAI({
			apiKey: apiKey,
		});
		const combinedText = texts.map((text, index) => `Article ${index + 1}: ${text}`).join('\n');
		const completion = await openai.chat.completions.create({
			model: MODEL,
			messages: [
				{
					role: 'user',
					content: `Generate a news anchor script for a one minute tik-tok style video for an app called NewsAInchor use some humor. Do not include any stage directions or segment headers. It should be based on the following three articles: ${combinedText}`,
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
