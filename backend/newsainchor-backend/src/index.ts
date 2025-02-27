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

interface ArticleDetails {
  title: string;
  description: string;
  generatedSummary: string;
  imageUrl: string;
  publisher: string;
  url: string;
}

async function writeToDb(key: string, value: string, db: KVNamespace) {
  try {
    await db.put(key, value);
  } catch (error) {
    console.error(`Failed to write to DB with key ${key}:`, error);
  }
}

async function handleRequest(env: Env) {
  const today = new Date().toISOString().split('T')[0];
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
//   console.log('Article contents:', articleContents);

  const articleSummaries: string[] = [];
  for (const content of articleContents) {
    const summary = await chatGPTApiUtils.summarizeText(env.CHAT_API_KEY, content);
    if (summary) {
      articleSummaries.push(summary);
    } else {
      console.error('Failed to generate summary for content:', content);
    }
  }
  console.log('Summarizing articles');
  console.log('Article summaries:', articleSummaries);
  
  const articleDetails: ArticleDetails[] = topArticlesLst.map((article: any) => ({
    title: article.title,
    description: article.description,
    generatedSummary: articleSummaries[topArticlesLst.indexOf(article)],
    imageUrl: article.image_url,
    publisher: article.source,
    url: article.url,
  }));
  console.log('Article details:', articleDetails);

  await writeToDb(today, JSON.stringify(articleDetails), env.article_summary);

  const anchorScript = await chatGPTApiUtils.generateAnchorScript(env.CHAT_API_KEY, articleSummaries, today);
  console.log('Generating anchor script');
  console.log('Anchor script:', anchorScript);

  const videoGenerationResponse = await tavusUtils.generateNewsVideo({
    deepFakeId: env.DEEPFAKE_ID,
    script: anchorScript,
    apiKey: env.TAVUS_API_KEY,
  });
  console.log('Generating news video');
  console.log('Video generation response:', videoGenerationResponse);
  
  // Polling for video generation status
  const videoId = videoGenerationResponse.video_id;
  let videoData: tavusUtils.VideoGenerationResponse = {
    status: '',
    stream_url: '',
    video_id: '',
    video_name: '',
    data: { script: '' },
    replica_id: '',
    created_at: '',
    updated_at: '',
    download_url: '',
    hosted_url: '',
    status_details: '',
    generation_progress: '',
  };

  const maxRetries = 40; // 20 minutes with 30 seconds interval
  const interval = 30000; // 30 seconds

  for (let i = 0; i < maxRetries; i++) {
    console.log(`Checking video status, attempt ${i + 1}`);
    videoData = await tavusUtils.getNewsVideo({ apiKey: env.TAVUS_API_KEY, videoId: videoId });
    if (videoData.status === 'ready') {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  if (videoData.status !== 'ready') {
    throw new Error('Video generation failed or timed out');
  }

  console.log('Video data:', videoData);
  await writeToDb(today, videoData.stream_url, env.video_date_db);

  return new Response('Success');
}

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    return handleRequest(env);
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: Ctx): Promise<void> {
    await handleRequest(env);
  },
};