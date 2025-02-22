import * as dotenv from 'dotenv';
import { parse } from 'node-html-parser';
dotenv.config();

const THE_NEWS_API = process.env.THE_NEWS_API_KEY;

interface NewsArticleParams {
    api_token: string;
    categories?: string;
    excludeCategories?: string;
    locale?: string;
    search?: string;
    published_on: string;
    language: string;
    limit: number;
}

export async function getTopNewsArticles(params: NewsArticleParams): Promise<any> {
    const options = {
        method: 'GET',
    };

    var esc = encodeURIComponent;
    var query = Object.keys(params)
        .map(function (k) {
            return esc(k) + '=' + esc((params as any)[k]);
        })
        .join('&');

    try {
        const response = await fetch(
            'https://api.thenewsapi.com/v1/news/top?' + query,
            options,
        );
        const result = await response.text();
        console.log(result);
        return result;
    } catch (error) {
        console.log('error', error);
        return 'Error fetching news articles';
    }
}

// Enhanced function to retrieve the content of an article from a given URL
export async function getArticleContent(url: string, snippet: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const html = await response.text();
        const dom = parse(html);

        // Try different selectors to find the main content
        const selectors = ['article', 'main', 'div.content', 'div.article-content'];
        let content = '';

        for (const selector of selectors) {
            content = dom.querySelector(selector)?.textContent || '';
            if (content.trim()) {
                break;
            }
        }
		if (!content.trim()) {
			const snippetIndex = html.indexOf(snippet);
			if (snippetIndex !== -1) {
			content = html.substring(snippetIndex);
			}
		}
		if (!content.trim()) {
			content = html;
		}
        const cleanedContent = content.replace(/\s+/g, ' ').trim();
        return cleanedContent;
    } catch (error) {
        console.error('Error fetching article content:', error);
        return 'error';
    }
}

// Example usage
// const articleContent = await getArticleContent('https://www.cnn.com/2022/02/21/investing/global-stocks-ukraine-russia/index.html');
// console.log(articleContent);