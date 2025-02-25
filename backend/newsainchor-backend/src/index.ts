import * as newsApiUtils from './utils/the_news_api_utils';
import * as tavusUtils from './utils/tavus_utils';
import * as chatGPTApiUtils from './utils/chat_gpt_utils';

interface Env {
	THE_NEWS_API_KEY: string;
	CHAT_API_KEY: string;
	TAVUS_API_KEY: string;
	DEEPFAKE_ID: string;
	video_date_db: KVNamespace;
	article_summary: KVNamespace;
}

interface Ctx {}

const today = new Date().toISOString().split('T')[0];

async function writeToDb(key: string, value: string, db: KVNamespace) {
	try {
		await db.put(key, value);
	} catch (error) {
		console.error(`Failed to write to DB with key ${key}:`, error);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
		console.log('Fetching top news articles');
		const topArticlesObject = await newsApiUtils.getTopNewsArticles({
			api_token: env.THE_NEWS_API_KEY as string,
			published_on: today,
			locale: 'us',
			limit: 3,
			language: 'en',
		});

		const topArticlesLst = JSON.parse(topArticlesObject).data;
		const articleUrlsAndContext = topArticlesLst.map((article: any) => ({ url: article.url, snippet: article.snippet.replace(/\.\.\.$/, '') }));
		console.log('Top articles:', articleUrlsAndContext);
		
		const articleContents: string[] = [];
		for (const article of articleUrlsAndContext) {
			const content = await newsApiUtils.getArticleContent(article.url, article.snippet);
			articleContents.push(content);
		}
		console.log('Fetching article content');
		console.log('Article contents:', articleContents);

		const articleSummaries: string[] = [];
		for (const content of articleContents) {
			const summary = await chatGPTApiUtils.summarizeText(env.CHAT_API_KEY, content);
			articleSummaries.push(summary);
		}
		console.log('Summarizing articles');
		console.log('Article summaries:', articleSummaries);
		const articleUrlSummaryDict: { [url: string]: string } = {};
		for (let i = 0; i < articleUrlsAndContext.length; i++) {
			articleUrlSummaryDict[articleUrlsAndContext[i].url] = articleSummaries[i];
		}
		console.log('Article URL and Summary Dictionary:', articleUrlSummaryDict);
		writeToDb(today, JSON.stringify(articleUrlSummaryDict), env.article_summary);

		const anchorScript = await chatGPTApiUtils.generateAnchorScript(env.CHAT_API_KEY, articleSummaries);
		console.log('Generating anchor script');
		console.log('Anchor script:', anchorScript);

		const videoGenerationResponse = await tavusUtils.generateNewsVideo({
			deepFakeId: env.DEEPFAKE_ID,
			script: anchorScript,
			apiKey: env.TAVUS_API_KEY,
		});
		console.log('Generating news video');
		console.log('Video generation response:', videoGenerationResponse);
		
		// Need to find a better way to wait for the video to be generated
		await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
		
		const videoId = videoGenerationResponse.video_id;
		console.log('Getting news video');
		const videoData = await tavusUtils.getNewsVideo({ apiKey: env.TAVUS_API_KEY, videoId: videoId });
		console.log('Video data:', videoData);
		writeToDb(today, videoData.stream_url, env.video_date_db);

		return new Response('Success');
	},
};