import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

export default function ArticleCardItem(title: string, description: string) {
    return (
        <View style={styles.cardItem}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    cardItem: {
        width: "80%"
    },
    title: {
        fontSize: 20,
        fontWeight: "bold"
    },
    description: {
        fontSize: 16
    },

})