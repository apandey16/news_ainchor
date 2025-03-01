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
        let jsonResult = JSON.parse(result);
		let attempts = 0;
		while (jsonResult.meta.returned === 0 && attempts < 5) {
			const retryResponse = await fetch(
			'https://api.thenewsapi.com/v1/news/top?' + query,
			options,
			);
			const retryResult = await retryResponse.text();
			jsonResult = JSON.parse(retryResult);
			attempts++;
		}
		if (jsonResult.meta.returned === 0) {
			throw new Error('No articles returned after 5 attempts');
		}
        console.log(result);
        return result;
    } catch (error) {
        console.log('error', error);
        return 'Error fetching news articles';
    }
}