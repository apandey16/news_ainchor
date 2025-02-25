import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";

import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Platform,
  TextStyle,
  View,
  ViewStyle,
  Text,
  Pressable,
  StyleSheet,
  ImageStyle,
  Share,
} from "react-native";

import { Overlay } from "react-native-elements";

import { Video } from "expo-av";
import { Image } from "expo-image";

const { height, width } = Dimensions.get("window");

interface VideoWrapper {
  data: ListRenderItemInfo<string>;
  allVideos: string[];
  visibleIndex: number;
  pause: () => void;
  share: (videoURL: string) => void;
  pauseOverride: boolean;
  overlay: () => void;
  overlayVisible: boolean;
  isTabFocused: boolean;
}

const VideoWrapper = ({
  data,
  allVideos,
  visibleIndex,
  pause,
  pauseOverride,
  share,
  overlay,
  overlayVisible,
  isTabFocused
}: VideoWrapper) => {
  const bottomHeight = useBottomTabBarHeight();
  const { index, item } = data;
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (!isTabFocused) {
      videoRef.current?.pauseAsync();
    }
  }, [isTabFocused]);

  return (
    <View
      style={{
        height: Platform.OS === "android" ? height - bottomHeight : height,
        width,
      }}
    >
      <Video
        source={{ uri: allVideos[index] }}
        style={{ height: height - bottomHeight, width }}
        isLooping
        shouldPlay={index === visibleIndex && !pauseOverride}
        resizeMode="cover"
        volume={1.0}
      />

      <Pressable onPress={overlay} style={$overlayContainer}>
        <Text style={$overlayText} numberOfLines={2} ellipsizeMode="tail">Title</Text>
        <Text style={$overlayText} numberOfLines={2} ellipsizeMode="tail">DescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescription</Text>  
      </Pressable>

      <Pressable onPress={pause} style={$overlay} />

      <Pressable onPress={() => share(item)} style={$shareButtonContainer}>
        <Image source="share" style={$shareButtonImage} />
        <Text style={$shareButtonText}>Share</Text>
      </Pressable>

      <Overlay isVisible={overlayVisible ?? false} onBackdropPress={overlay ?? (() => {})}>
        <View style={{ padding: 20 }}>
          <Text style={$overlayText}>Title</Text>
          <Text style={$overlayText}>DescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescription</Text>
          <View style={{ flexDirection: "column", justifyContent: "space-around", gap: 10 }}>
        <Pressable style={$squareButton} onPress={() => console.log("Square 1 clicked")}>
          <Text style={$overlayText}>Square 1</Text>
        </Pressable>
        <Pressable style={$squareButton} onPress={() => console.log("Square 2 clicked")}>
          <Text style={$overlayText}>Square 2</Text>
        </Pressable>
        <Pressable style={$squareButton} onPress={() => console.log("Square 3 clicked")}>
          <Text style={$overlayText}>Square 3</Text>
        </Pressable>
          </View>
        </View>
      </Overlay>
    </View>
  );
};

export default function HomeScreen() {
  const bottomHeight = useBottomTabBarHeight();

  const videos = ["https://stream.mux.com/ylqmQuaYdXzI8CIzqfYbH1ZTU2U7GJ6sEUlnW9jcyZ4.m3u8", "https://videos.pexels.com/video-files/5532771/5532771-sd_226_426_25fps.mp4"];

  const [allVideos, setAllVideos] = useState(videos);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [pauseOverride, setPauseOverride] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const onViewableItemsChanged = (event: any) => {
    const newIndex = Number(event.viewableItems.at(-1).key);
    setVisibleIndex(newIndex);
    setPauseOverride(false)
  };

  const pause = () => {
    setPauseOverride(!pauseOverride);
  };

  const share = (videoURL: string) => {
    setPauseOverride(true);
    setTimeout(() => {
      Share.share({
        title: "Share This Video",
        message: `Check out: ${videoURL}`,
      });
    }, 100);
  };

  const overlay = () => {
    setOverlayVisible(!overlayVisible);
  }

  const focused = useIsFocused();

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <FlatList
        pagingEnabled
        snapToInterval={
          Platform.OS === "android" ? height - bottomHeight : undefined
        }
        initialNumToRender={1}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        data={allVideos}
        onEndReachedThreshold={0.3}
        renderItem={(data) => {
          return (
            <VideoWrapper
              data={data}
              allVideos={allVideos}
              visibleIndex={visibleIndex}
              pause={pause}
              share={share}
              pauseOverride={pauseOverride}
              overlay={overlay}
              overlayVisible={overlayVisible}
              isTabFocused={focused}
            />
          );
        }}
      />
      {pauseOverride && (
        <Pressable style={$pauseIndicator}>
          <Image source="pause" style={$playButtonImage} />
        </Pressable>
      )}
    </View>
  );
}

const $overlay: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "black",
  opacity: 0.3,
};

const $pauseIndicator: ViewStyle = {
  position: "absolute",
  alignSelf: "center",
  top: height / 2 - 25,
};

const $playButtonImage: ImageStyle = {
  height: 50,
  width: 50,
  justifyContent: "center",
  alignItems: "center",
  resizeMode: "contain",
};

const $overlayContainer: ViewStyle = {
  position: "absolute",
  zIndex: 999,
  elevation: 999,
  bottom: Platform.OS === "android" ? 70 : 100,
  left: 10,
  alignItems: "left",
  gap: 8,
  maxWidth: width * 0.6
};

const $overlayText: TextStyle = {
  color: "white",
}

const $shareButtonContainer: ViewStyle = {
  position: "absolute",
  zIndex: 999,
  elevation: 999,
  bottom: Platform.OS === "android" ? 70 : 100,
  right: 10,
  alignItems: "center",
  gap: 8,
};

const $shareButtonImage: ImageStyle = {
  height: 25,
  width: 25,
  justifyContent: "center",
  alignItems: "center",
  resizeMode: "contain",
  tintColor: "white",
};

const $shareButtonText: TextStyle = {
  color: "white",
  fontSize: 12,
  fontWeight: "bold",
};

const $squareButton: ViewStyle = {
  width: width * 0.8,
  height: width * 0.4,
  backgroundColor: "gray",
  justifyContent: "center",
  alignItems: "center",
};
