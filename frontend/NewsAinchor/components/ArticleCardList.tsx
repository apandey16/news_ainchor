import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ArticleCardItem from './ArticleCardItem';
import { FlatList } from 'react-native';

export default function ArticleCardList({ articles }: { articles: Array<{ title: string, description: string, imageUrl: string, publisher: string, url: string }> }) {
    return (
        <View style={styles.container}>
            <FlatList
                data={articles}
                renderItem={({ item }) => <ArticleCardItem title={item.title} description={item.description} imageUrl={item.imageUrl} publisher={item.publisher} url={item.url} />}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        width: '90%'
    }
});