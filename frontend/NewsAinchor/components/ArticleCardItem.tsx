import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Image, TouchableOpacity, Linking } from 'react-native';
import { useColorScheme } from 'react-native';

interface ArticleCardItemProps {
    title: string;
    description: string;
    imageUrl: string;
    publisher: string;
    url: string;
    dark?: boolean;
}

export default function ArticleCardItem({ title, description, imageUrl, publisher, url, dark }: ArticleCardItemProps) {
      let color = useColorScheme() === 'dark' || dark ? '#172b45' : 'white';
      let textColor = useColorScheme() === 'dark' || dark ? '#DBE9F4' : 'black';
      let descriptionColor = useColorScheme() === 'dark' || dark ? '#6a7f99' : 'black';
    return (
        <TouchableOpacity style={[styles.cardItem, {backgroundColor: color}]} onPress={() => Linking.openURL(url)}>
            <View style={{ flexDirection: 'column', width: "100%"}}>
                <View style={{ flexDirection: 'row'}}>
                    <View style={{flex: 4}}>
                        <Text style={styles.publisher}>{publisher}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.textContainer}>
                                <View style={styles.header}>
                                    <Text style={[styles.title, {color: textColor}]} numberOfLines={4} ellipsizeMode='tail'>{title}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                </View>
                <Text style={[styles.description, {color: descriptionColor}]} numberOfLines={2} ellipsizeMode='tail'>{description}</Text>
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
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
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
        color: 'gray',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        marginTop: 4,
    },
});