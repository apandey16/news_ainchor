import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LaunchPage = () => {
    const navigation = useNavigation();

    const goToNewsScreen = () => {
        navigation.navigate("(tabs)");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to NewsAInchor</Text>
            <Button title="Go to News Screen" onPress={goToNewsScreen} />
        </View>
    );
};

LaunchPage.navigationOptions = {
    headerShown: false,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default LaunchPage;