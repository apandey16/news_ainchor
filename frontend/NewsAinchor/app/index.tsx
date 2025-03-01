import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LaunchPage = () => {
    const navigation = useNavigation();

    const goToNewsScreen = () => {
        navigation.navigate("(tabs)");
    };

    return (
        <View style={styles.container}>
            <Image source={require('@/assets/images/News-AInchor-Logo-Blue.png')} style={{width: Dimensions.get('window').width, height: Dimensions.get('window').width }} />
            <View style={{bottom: "-5%", alignContent: 'center'}}>
                <Text style={styles.title}>Welcome to NewsAInchor!</Text>
                <Text style={styles.title}>Your Automatic Reporter Awaits</Text>
                <TouchableOpacity onPress={goToNewsScreen} style={styles.contactButton}>
                    <Text style={styles.contactButtonText}>Go to News Screen</Text>
                </TouchableOpacity>
            </View>
            
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
        backgroundImage: "@/assets/images/News-AInchor-Logo-Blue.png",
        backgroundColor: '#2d5286',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        alignSelf: 'center',
        color: '#DBE9F4'
    },
    contactButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 32,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
      },
});

export default LaunchPage;