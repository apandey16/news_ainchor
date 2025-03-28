import { StyleSheet, Switch, TouchableOpacity, Linking, Alert, SafeAreaView, View, Text, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { color } from 'react-native-elements/dist/helpers';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(existingStatus === 'granted');
  };

  const handleNotificationToggle = async () => {
    try {
      if (!notificationsEnabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          setNotificationsEnabled(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates.',
            [{ text: 'OK' }]
          );
          setNotificationsEnabled(false);
        }
      } else {
        Alert.alert(
          'Disable Notifications',
          'To disable notifications, please go to your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error handling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleContactPress = () => {
    Linking.openURL('mailto:newsainchor@gmail.com');
  };

  let textColor = useColorScheme() === 'dark' ? '#DBE9F4' : 'black';
  let buttonText = useColorScheme() === 'dark' ? '#DBE9F4' : 'white';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.pageTitle}>Settings</ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedText style={styles.settingLabel}>Enable Notifications</ThemedText>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
          />
        </ThemedView>
        <View style={{height: "10%"}}>
        </View>
        <View style={{height: "30%", width: "90%", alignSelf: "center"}}>
          <Text style={[styles.welcomeText, {color : textColor}]}>Thank you for using News AInchor!</Text>
          <View style={{height: "50%"}}></View>
          <Text style={[styles.welcomeText2, {color : textColor}]}>Since we are still early in release please let us know of any bugs you find or features you would want in the app. Your ideas will help us make the app the perfect news app of your dreams!</Text>

        </View>
        <View style={{height: "15%"}} />
        <TouchableOpacity onPress={handleContactPress} style={styles.contactButton}>
          <ThemedText style={[styles.contactButtonText, {color: buttonText}]}>Contact Us</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 16,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeText2: {
    fontSize: 20,
    textAlign: 'center',
  },
});
