import { StyleSheet, View, Text } from 'react-native';
import React from 'react';

import ArticleCardList from '@/components/ArticleCardList';

// Example usage of ArticleCardList component
const exampleArticles = [
  {
      title: "Article 1",
      description: "Description for article 1",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Smiley.svg/1200px-Smiley.svg.png",
      publisher: "Publisher 1",
      url: "https://example.com/article1"
  },
  {
      title: "Article 2",
      description: "a very long description for article 2 that should be truncated or else it may run out of space and look bad on the screen",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Smiley.svg/1200px-Smiley.svg.png",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Smiley.svg/1200px-Smiley.svg.png",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Smiley.svg/1200px-Smiley.svg.png",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Smiley.svg/1200px-Smiley.svg.png",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://example.com/image2.jpg",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://example.com/image2.jpg",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://example.com/image2.jpg",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://example.com/image2.jpg",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://example.com/image2.jpg",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  },
  {
      title: "Article 2",
      description: "Description for article 2",
      imageUrl: "https://example.com/image2.jpg",
      publisher: "Publisher 2",
      url: "https://example.com/article2"
  }
];

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Today's Stories</Text>
        <ArticleCardList articles={exampleArticles}></ArticleCardList>
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
    marginVertical: "15%",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
