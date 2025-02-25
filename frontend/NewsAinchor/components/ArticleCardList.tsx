import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ArticleCardItem from './ArticleCardItem';

export default function ArticleCardList(articles: Array<{title: string, description: string}>) {
   <View style={styles.container}>
        <ArticleCardItem />
   </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})