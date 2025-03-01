import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import React from 'react';
import ArticleCardItem from './ArticleCardItem';
import { FlatList } from 'react-native';

export default function ArticleCardList({ articles }: { articles: Array<{ title: string, description: string, imageUrl: string, publisher: string, url: string }> }) {
    let textColor = useColorScheme() === 'dark' ? '#DBE9F4' : 'black';
    return (
        <FlatList
            data={[{ title: "Today's Stories", description: '', imageUrl: '', publisher: '', url: '' }, ...articles]}
            renderItem={({ item, index }) => 
            index === 0 ? (
                <Text style={[styles.title, {color: textColor}]}>{item.title}</Text>
            ) : (
                <ArticleCardItem title={item.title} description={item.description} imageUrl={item.imageUrl} publisher={item.publisher} url={item.url} />
            )
            }
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.list}
        />
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
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        alignSelf: 'center',
    },
});