import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Image, TouchableOpacity, Linking } from 'react-native';

interface ArticleCardItemProps {
    title: string;
    description: string;
    imageUrl: string;
    publisher: string;
    url: string;
}

export default function ArticleCardItem({ title, description, imageUrl, publisher, url }: ArticleCardItemProps) {
    return (
        <TouchableOpacity style={styles.cardItem} onPress={() => Linking.openURL(url)}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.textContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.publisher}>{publisher}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2} ellipsizeMode='tail'>{description}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    cardItem: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        width: Dimensions.get('window').width * 0.9,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        flexWrap: 'wrap',
    },
    publisher: {
        fontSize: 14,
        color: '#888',
        marginLeft: 10,
    },
    description: {
        fontSize: 16,
        marginTop: 4,
    },
});