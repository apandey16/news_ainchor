import * as dotenv from 'dotenv';
import axios from 'axios';
import { JSDOM } from 'jsdom';
dotenv.config();

const THE_NEWS_API = process.env.THE_NEWS_API_KEY;

// Use the news api to get the top articles, use the URL provided to scrape the websites and then get the content
// return the content as the function output so it cna be passed to the GPT-4o-mini model

interface NewsArticleParams {
	api_token: string;
	catagories?: string;
	excludeCategories?: string;
    locale?: string;
	search?: string;
	published_on: string;
	language: string;
	limit: number;
}

// Get the top news articles based on the parameters provided
export async function getTopNewsArticles(params: NewsArticleParams) {
	const options = {
		method: 'GET',
	};

	var esc = encodeURIComponent;
	var query = Object.keys(params)
		.map(function (k) {
			return esc(k) + '=' + esc((params as any)[k]);
		})
		.join('&');

	await fetch(
		' https://api.thenewsapi.com/v1/news/top?' + query,
		options,
	)
		.then((response) => response.text())
        .then((result) => {
            console.log(result);
            return result;
        })
		.catch((error) => console.log('error', error));
}

// Sample usage
// await getTopNewsArticles({
// 	api_token: THE_NEWS_API as string,
// 	published_on: '2022-02-21',
// 	locale: 'us',
// 	limit: 3,
//     language: 'en',
// });

// Retrieve the content of an article from a given URL 
export async function getArticleContent(url: string): Promise<string> {
	try {
		const response = await axios.get(url);
		const dom = new JSDOM(response.data);
		const content = dom.window.document.querySelector('article')?.textContent || '';
		const cleanedContent = content.replace(/\s+/g, ' ').trim();
		return cleanedContent;
	} catch (error) {
		console.error('Error fetching article content:', error);
		return '';
	}
}

// Example usage
// this isn't perfect but it can work
// const articleContent = await getArticleContent('https:\/\/www.cnn.com\/2022\/02\/21\/investing\/global-stocks-ukraine-russia\/index.html');
// console.log(articleContent);