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
  isPolitical: boolean;
}

async function writeToDb(key: string, value: string, db: KVNamespace) {
  try {
    // First check if a value exists for this key
    const existingData = await db.get(key);
    console.log('Attempting to write to key:', key);
    console.log('New value type:', typeof value);
    console.log('New value first 100 chars:', value.substring(0, 100));
    
    if (existingData) {
      console.log('Found existing data type:', typeof existingData);
      console.log('Existing data first 100 chars:', existingData.substring(0, 100));
      
      let dataArray: any[] = [];
      
      // Parse existing data
      try {
        const parsedExisting = JSON.parse(existingData);
        dataArray = Array.isArray(parsedExisting) ? parsedExisting : [parsedExisting];
        console.log('Successfully parsed existing data, array length:', dataArray.length);
      } catch (parseError) {
        console.log('Failed to parse existing data, treating as single item');
        dataArray = [existingData];
      }

      // Parse new value
      let newValue;
      try {
        newValue = JSON.parse(value);
        console.log('Successfully parsed new value');
      } catch {
        console.log('New value is not JSON, using as is');
        newValue = value;
      }

      // Add new value to array
      dataArray.push(newValue);
      console.log('New array length after push:', dataArray.length);

      // Save back to KV
      const finalJson = JSON.stringify(dataArray);
      console.log('Final data first 100 chars:', finalJson.substring(0, 100));
      await db.put(key, finalJson);
      console.log('Successfully saved updated array to KV');
      
    } else {
      console.log('No existing data found for key:', key);
      // For new entries, still wrap in array
      let initialArray;
      try {
        // Try to parse the value in case it's JSON
        const parsedValue = JSON.parse(value);
        initialArray = [parsedValue];
      } catch {
        // If not JSON, use as is
        initialArray = [value];
      }
      const finalJson = JSON.stringify(initialArray);
      console.log('Initial array first 100 chars:', finalJson.substring(0, 100));
      await db.put(key, finalJson);
      console.log('Successfully saved new array to KV');
    }
  } catch (error: any) {
    console.error('Failed to write to DB:', error);
    console.error('Error details:', {
      key,
      valueType: typeof value,
      valueLength: value.length,
      error: error.message
    });
    throw error;
  }
}
// Date utility functions
function formatDateForApi(displayDate: string): string {
  // Convert from DD-MM-YYYY to YYYY-MM-DD for API calls
  if (!isValidDisplayDate(displayDate)) {
    console.error('Invalid display date format:', displayDate);
    throw new Error(`Invalid date format: ${displayDate}. Expected DD-MM-YYYY`);
  }
  const [day, month, year] = displayDate.split('-');
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date: Date): string {
  // Format as DD-MM-YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getCurrentDate(): string {
  // Get current date in Los Angeles (Pacific) time in DD-MM-YYYY format
  const now = new Date();
  const laPacificDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  
  // Ensure we're using the correct timezone
  const options = { timeZone: 'America/Los_Angeles' };
  const laDate = new Date(laPacificDate.toLocaleString('en-US', options));
  
  // Format as DD-MM-YYYY
  const day = String(laDate.getDate()).padStart(2, '0');
  const month = String(laDate.getMonth() + 1).padStart(2, '0');
  const year = laDate.getFullYear();
  
  console.log('Current time in Los Angeles:', laDate.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'full',
    timeStyle: 'long'
  }));
  
  return `${day}-${month}-${year}`;
}

function isValidDisplayDate(dateStr: string): boolean {
  // Check if string is in DD-MM-YYYY format
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateStr)) return false;
  
  const [day, month, year] = dateStr.split('-').map(Number);
  
  // Check if date is valid
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
}

async function handleRequest(env: Env, date?: string) {
  try {
    // Always use DD-MM-YYYY format for display and storage
    const displayDate = date && isValidDisplayDate(date) ? date : getCurrentDate();
    
    // Convert to YYYY-MM-DD only for API calls
    const apiDate = formatDateForApi(displayDate);
    
    console.log('Display/Storage date (DD-MM-YYYY):', displayDate);
    console.log('API date (YYYY-MM-DD):', apiDate);
    console.log('Current time in Los Angeles:', new Date().toLocaleString('en-US', { 
      timeZone: 'America/Los_Angeles',
      dateStyle: 'full',
      timeStyle: 'long'
    }));

    // 1. Fetch top news articles
    console.log('Step 1: Fetching top news articles');
    const topArticlesObject = await newsApiUtils.getTopNewsArticles({
      api_token: env.THE_NEWS_API_KEY as string,
      published_on: apiDate, // Use YYYY-MM-DD format for API
      locale: 'us',
      limit: 3,
      language: 'en',
    });

    if (!topArticlesObject) {
      throw new Error('Failed to fetch top articles: No response from API');
    }

    const parsedArticles = JSON.parse(topArticlesObject);
    if (!parsedArticles.data || !Array.isArray(parsedArticles.data)) {
      console.error('Invalid articles response:', parsedArticles);
      throw new Error('Invalid response format from news API');
    }

    const topArticlesLst = parsedArticles.data;
    console.log(`Retrieved ${topArticlesLst.length} articles`);

    // 2. Extract article URLs and snippets and check for political categories
    const articleUrlsAndContext = topArticlesLst.map((article: any) => {
      // Check if the article has categories and if any of them are related to politics
      const politicalCategories = ['politics', 'government', 'election', 'political'];
      
      // The API might return categories as an array of strings or a single comma-separated string
      let categories: string[] = [];
      if (article.categories) {
        if (Array.isArray(article.categories)) {
          categories = article.categories;
        } else if (typeof article.categories === 'string') {
          categories = article.categories.split(',').map((cat: string) => cat.trim());
        }
      }
      
      // Also check if the title or description contains political keywords
      const titleAndDesc = `${article.title} ${article.description}`.toLowerCase();
      const hasPoliticalKeywords = politicalCategories.some(keyword => 
        titleAndDesc.includes(keyword.toLowerCase())
      );
      
      const isPolitical = 
        hasPoliticalKeywords || 
        categories.some(category => 
          politicalCategories.some(polCat => 
            category.toLowerCase().includes(polCat)
          )
        );
      
      if (isPolitical) {
        console.log(`Article flagged as POLITICAL: ${article.title}`);
      }
      
      return {
        url: article.url,
        snippet: article.snippet ? article.snippet.replace(/\.\.\.$/, '') : article.description,
        isPolitical: isPolitical || false
      };
    });
    console.log('Article URLs and snippets:', articleUrlsAndContext);

    // 3. Fetch article contents
    console.log('Step 2: Fetching article contents');
    const articleContents: string[] = [];
    for (const article of articleUrlsAndContext) {
      console.log('Fetching content for:', article.url);
      const content = await newsApiUtils.getArticleContent(article.url, article.snippet);
      if (content === 'error') {
        console.error('Failed to fetch content for:', article.url);
        continue;
      }
      articleContents.push(content);
    }

    if (articleContents.length === 0) {
      throw new Error('Failed to fetch any article contents');
    }
    console.log(`Successfully fetched ${articleContents.length} article contents`);

    // 4. Generate summaries
    console.log('Step 3: Generating article summaries');
    const articleSummaries: string[] = [];
    for (const [index, content] of articleContents.entries()) {
      console.log(`Generating summary for article ${index + 1}`);
      try {
        const summary = await chatGPTApiUtils.summarizeText(env.CHAT_API_KEY, content);
        if (summary) {
          articleSummaries.push(summary);
          console.log(`Summary ${index + 1} generated successfully`);
        } else {
          console.error(`Failed to generate summary for article ${index + 1}`);
        }
      } catch (error) {
        console.error(`Error generating summary for article ${index + 1}:`, error);
      }
    }

    if (articleSummaries.length === 0) {
      throw new Error('Failed to generate any article summaries');
    }
    console.log(`Generated ${articleSummaries.length} summaries`);

    // 5. Create article details
    const articleDetails: ArticleDetails[] = topArticlesLst.map((article: any, index: number) => ({
      title: article.title,
      description: article.description,
      generatedSummary: articleSummaries[index],
      imageUrl: article.image_url,
      publisher: article.source,
      url: article.url,
      isPolitical: articleUrlsAndContext[index]?.isPolitical || false
    }));

    // 6. Save to KV
    console.log('Step 4: Saving article details to KV');
    await writeToDb(displayDate, JSON.stringify(articleDetails), env.article_summary);
    console.log('Article details saved successfully');

    // 7. Generate anchor script
    console.log('Step 5: Generating anchor script');
    
    // Create an array of article summaries with political flags
    const flaggedSummaries = articleSummaries.map((summary, index) => ({
      summary,
      isPolitical: articleDetails[index].isPolitical
    }));
    
    const anchorScript = await chatGPTApiUtils.generateAnchorScript(env.CHAT_API_KEY, flaggedSummaries, displayDate);
    if (!anchorScript) {
      throw new Error('Failed to generate anchor script');
    }
    console.log('Anchor script generated successfully');

    // 8. Generate video
    console.log('Step 6: Initiating video generation');
    const videoGenerationResponse = await tavusUtils.generateNewsVideo({
      deepFakeId: env.DEEPFAKE_ID,
      script: anchorScript,
      apiKey: env.TAVUS_API_KEY,
      date: displayDate,
    });
    console.log('Video generation initiated:', videoGenerationResponse);

    // 9. Poll for video completion
    console.log('Step 7: Polling for video completion');
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

    // Check if a video already exists in Tavus with this same name/ID
    // This helps if a previous run created the video but failed to update the database
    const maxRetries = 40;
    const interval = 30000; // 30 seconds
    let completed = false;

    try {
      for (let i = 0; i < maxRetries; i++) {
        console.log(`Checking video status, attempt ${i + 1}/${maxRetries}`);
        try {
          videoData = await tavusUtils.getNewsVideo({ apiKey: env.TAVUS_API_KEY, videoId: videoId });
          console.log('Video status:', videoData.status, 'Progress:', videoData.generation_progress);
          
          if (videoData.status === 'ready') {
            console.log('Video generation completed successfully');
            completed = true;
            break;
          }
          if (videoData.status === 'failed') {
            throw new Error(`Video generation failed: ${videoData.status_details}`);
          }
        } catch (statusError) {
          console.error('Error checking video status:', statusError);
          // Continue polling even if a single status check fails
        }
        
        // Wait before the next check
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      // If we didn't explicitly see the video as ready, make one last attempt to fetch it
      if (!completed) {
        try {
          videoData = await tavusUtils.getNewsVideo({ apiKey: env.TAVUS_API_KEY, videoId: videoId });
          if (videoData.status === 'ready') {
            console.log('Video generation completed on final check');
            completed = true;
          } else {
            console.log('Final video status check:', videoData.status, 'Progress:', videoData.generation_progress);
          }
        } catch (finalCheckError) {
          console.error('Error on final video status check:', finalCheckError);
        }
      }

      // Only throw timeout error if we still don't have a ready status and no stream URL
      if (!completed && !videoData.stream_url) {
        throw new Error(`Video generation timed out after ${maxRetries} attempts and no stream URL is available`);
      }
    } catch (pollingError) {
      console.error('Error during video polling:', pollingError);
      // Check if we might have a stream URL despite the error
      if (!videoData.stream_url) {
        throw pollingError; // Re-throw if we don't have a usable URL
      }
    }

    // 10. Save video URL - try even if we hit polling issues but have a URL
    console.log('Step 8: Saving video URL to KV');
    if (!videoData.stream_url) {
      // Try one more time to check if the video might be available via direct fetch
      try {
        console.log('Making final attempt to fetch video with ID:', videoId);
        const finalCheck = await tavusUtils.getNewsVideo({ apiKey: env.TAVUS_API_KEY, videoId: videoId });
        if (finalCheck.stream_url) {
          console.log('Found stream URL on final attempt');
          videoData = finalCheck;
        } else {
          console.error('No stream_url found in video data, even after final check');
          throw new Error('Video generation completed but no stream_url was provided');
        }
      } catch (error) {
        console.error('Final video fetch attempt failed:', error);
        throw new Error('Unable to retrieve video URL after multiple attempts');
      }
    }
    
    // Now save the URL to KV storage
    console.log('Video URL to save:', videoData.stream_url);
    try {
      // Attempt to save the video URL to KV database
      await writeToDb(displayDate, videoData.stream_url, env.video_date_db);
      
      // Verify the video URL was saved correctly with retry logic
      let savedUrl = null;
      let verifyAttempts = 0;
      const maxVerifyAttempts = 3;
      
      while (!savedUrl && verifyAttempts < maxVerifyAttempts) {
        try {
          savedUrl = await env.video_date_db.get(displayDate);
          if (savedUrl) {
            console.log('Video URL saved and verified in video_date_db');
            break;
          } else {
            console.log(`URL verification attempt ${verifyAttempts + 1}/${maxVerifyAttempts} failed, retrying...`);
            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (verifyError) {
          console.error(`Verification attempt ${verifyAttempts + 1} error:`, verifyError);
        }
        verifyAttempts++;
      }
      
      if (!savedUrl) {
        console.error('Video URL could not be verified in KV after multiple attempts');
        // Don't throw here, as we still want to return success if the video was generated
      }
    } catch (error) {
      console.error('Failed to save video URL:', error);
      // Don't throw an error here - if the video was generated successfully, 
      // we want to return success even if DB save failed
      console.log('Continuing despite database save error - video was generated');
    }

    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('HandleRequest failed:', error);
    throw error; // Re-throw to be caught by the scheduled handler
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    // Extract date from request if provided
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    return handleRequest(env, dateParam || undefined);
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: Ctx): Promise<Response> {
    try {
      console.log('Starting scheduled task at:', new Date().toISOString());
      const response = await handleRequest(env); // Uses today's date by default
      console.log('Completed scheduled task at:', new Date().toISOString());
      return response;
    } catch (error) {
      console.error('Scheduled task failed:', error);
      return new Response('Scheduled task failed: ' + (error as Error).message, { status: 500 });
    }
  },
};