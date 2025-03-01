import { StyleSheet, View, Text } from 'react-native';
import React from 'react';

import ArticleCardList from '@/components/ArticleCardList';

import { getTopNewsArticles } from "@/app/utils/the_news_api_utils";
import { THE_NEWS_API_KEY } from "@env";
import moment from 'moment';
import { useEffect, useState } from 'react';
import {useColorScheme} from 'react-native';
  
  // Example usage of ArticleCardList component
  const fetchTopArticles = async (): Promise<string> => {
    const today = moment().format('YYYY-MM-DD'); // Get today's date
    console.log("Today's date: ", today);
  
    return await getTopNewsArticles({
      api_token: THE_NEWS_API_KEY as string,
      published_on: today, // Use YYYY-MM-DD format for API
      locale: 'us',
      limit: 3,
      language: 'en',
    });
  };
  
  const parseJson = (result: string) => {
    let articles = JSON.parse(result);
    let data = articles.data;

    return data.map((article: any) => ({
      title: article.title,
      description: article.description,
      imageUrl: article.image_url,
      publisher: article.source,
      url: article.url,
    }));
  }
  
export default function TabTwoScreen() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const result = await fetchTopArticles();
        const parsedArticles = parseJson(result);
        setArticles(parsedArticles);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchArticles();
  }, []);

  let backgroundColor = useColorScheme() === 'dark' ? '#07172c' : 'white';

  console.log(articles);
  return (
    <View style={[styles.container, {backgroundColor: backgroundColor}]}>
      <View style={styles.subContainer}>
        <ArticleCardList articles={articles}></ArticleCardList>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    marginVertical: "15%"
  },
});
