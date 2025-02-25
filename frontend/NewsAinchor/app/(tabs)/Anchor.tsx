import React from 'react';
import { FlatList, StyleSheet, View, Dimensions, Text } from 'react-native';
import { Video } from 'expo-av';

const videos = [
  { id: '1', uri: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Video 1', description: 'This is'},
  { id: '2', uri: 'https://www.w3schools.com/html/movie.mp4', title: 'Video 2', description: 'This is' },
  // Add more video URIs here
];

export default function HomeScreen() {
  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.videoContainer}>
          <Text style={styles.overlayText}> Testing Testing</Text>
          <Video
            source={{ uri: item.uri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            isLooping
            style={styles.video}
          />
          <Text style={styles.overlayText}>{item.title}</Text>
          <Text style={styles.overlayDescriptionText}>{item.description}</Text>
        </View>
      )}
      pagingEnabled
      horizontal={false}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlayText: {
    position: 'relative',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    bottom: "15%",
    textAlign: "left",
    right: "35%",
    margin: 5,
    textShadowColor: 'black',
    textShadowOffset: { width: -0, height: 0 },
    textShadowRadius: 3,
  },
  overlayDescriptionText: {
    position: 'relative',
    color: 'white',
    fontSize: 20,
    // fontWeight: 'bold',
    bottom: "15%",
    textAlign: "left",
    right: "35%",
    textShadowColor: 'black',
    textShadowOffset: { width: -0, height: 0 },
    textShadowRadius: 3,
  },
});