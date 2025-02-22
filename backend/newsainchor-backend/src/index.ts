import * as newsApiUtils from './utils/the_news_api_utils';
import * as tavusUtils from './utils/tavus_utils';
import * as chatGPTApiUtils from './utils/chat_gpt_utils';


interface Env {
	THE_NEWS_API_KEY: string;
	CHAT_API_KEY: string;
	TAVUS_API_KEY: string;
	DEEPFAKE_ID: string;
}

interface Ctx {}

const today = new Date().toISOString().split('T')[0];

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
			const summary = await chatGPTApiUtils.summarizeText(content);
			articleSummaries.push(summary);
		}
		console.log('Summarizing articles');
		console.log('Article summaries:', articleSummaries);

		const anchorScript = await chatGPTApiUtils.generateAnchorScript(articleSummaries);
		console.log('Generating anchor script');
		console.log('Anchor script:', anchorScript);

		const videoGenerationResponse = await tavusUtils.generateNewsVideo({
			deepFakeId: env.DEEPFAKE_ID,
			script: anchorScript,
		});
		console.log('Generating news video');
		console.log('Video generation response:', videoGenerationResponse);
		

		return new Response('Success');
	},
};