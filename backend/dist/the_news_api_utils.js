import * as dotenv from 'dotenv';
import axios from 'axios';
import { JSDOM } from 'jsdom';
dotenv.config();
const THE_NEWS_API = process.env.THE_NEWS_API_KEY;
export async function getTopNewsArticles(params) {
    const options = {
        method: 'GET',
    };
    var esc = encodeURIComponent;
    var query = Object.keys(params)
        .map(function (k) {
        return esc(k) + '=' + esc(params[k]);
    })
        .join('&');
    await fetch(' https://api.thenewsapi.com/v1/news/top?' + query, options)
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
async function getArticleContent(url) {
    var _a;
    try {
        const response = await axios.get(url);
        const dom = new JSDOM(response.data);
        const content = ((_a = dom.window.document.querySelector('article')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
        const cleanedContent = content.replace(/\s+/g, ' ').trim();
        return cleanedContent;
    }
    catch (error) {
        console.error('Error fetching article content:', error);
        return '';
    }
}
// Example usage
const articleContent = await getArticleContent('https:\/\/www.cnn.com\/2022\/02\/21\/investing\/global-stocks-ukraine-russia\/index.html');
console.log(articleContent);
//# sourceMappingURL=the_news_api_utils.js.map