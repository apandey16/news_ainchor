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

import ArticleCardItem from "@/components/ArticleCardItem";

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
  isTabFocused,
}: VideoWrapper) => {
  const bottomHeight = useBottomTabBarHeight();
  const { index, item } = data;
  const videoRef = useRef<Video>(null);

  const exampleArticles =  [{"description": "The appointment of a January 6 denier at the FBI should be and is incredibly worrying.", "imageUrl": "https://compote.slate.com/images/24c63d16-8900-46e1-a529-a8c4f6aeab2d.png?crop=1080%2C720%2Cx100%2Cy0&width=1560", "publisher": "slate.com", "title": "Trump’s FBI: Kash Patel and Dan Bongino aren’t interested in the law", "url": "https://slate.com/podcasts/amicus/2025/03/trumps-fbi-kash-patel-and-dan-bongino-arent-interested-in-the-law?via=rss"}, {"description": "Crispy potatoes have a 'boat-load of flavour'", "imageUrl": "https://cdn.mos.cms.futurecdn.net/8T6ym6L8vj3uakQtshgkpn-1200-80.jpg", "publisher": "theweek.com", "title": "Wine & shallot roast potatoes recipe", "url": "https://theweek.com/culture-life/food-drink/wine-and-shallot-roast-potatoes-recipe"}, {"description": "This is one of the biggest deals ever carved out at the EFM market and comes after a hot pursuit.", "imageUrl": "https://deadline.com/wp-content/uploads/2025/02/Good-Sex-Natalie-Portman.jpg?w=1024", "publisher": "deadline.com", "title": "Netflix Wins Out In Big Auction For Natalie Portman-Lena Dunham Rom-Com ‘Good Sex’", "url": "https://deadline.com/2025/02/netflix-buying-natalie-portman-lena-dunham-rom-com-good-sex-1236297140/"}]

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
      <Overlay isVisible={overlayVisible} onBackdropPress={overlay} fullScreen={false} backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.50)' }} overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.0)', bottom: "-7%" }}>
        <View>
          <View style={{width: "90%", alignSelf: 'center'}}>
            <Text style={$overlayText}>Enjoy The Articles Yourself!</Text>
            {/* <Text style={$overlayText}>Please Read More! Click any of the links below to read the article we got our information from.</Text> */}
          </View>
          <View style={{ flexDirection: "column", justifyContent: "space-around", opacity: 2, alignSelf: 'center' }}>
            <ArticleCardItem title={exampleArticles[0].title} description={exampleArticles[0].description} imageUrl={exampleArticles[0].imageUrl} publisher={exampleArticles[0].publisher} url={exampleArticles[0].url} dark={true} />
            <ArticleCardItem title={exampleArticles[1].title} description={exampleArticles[1].description} imageUrl={exampleArticles[1].imageUrl} publisher={exampleArticles[1].publisher} url={exampleArticles[1].url} dark={true} />
            <ArticleCardItem title={exampleArticles[2].title} description={exampleArticles[2].description} imageUrl={exampleArticles[2].imageUrl} publisher={exampleArticles[2].publisher} url={exampleArticles[2].url} dark={true} />
            </View>
        </View>
      </Overlay>
      <Pressable onPress={overlay} style={$overlayContainer}>
        <Text style={$Title} numberOfLines={2} ellipsizeMode="tail">Title</Text>
        <Text style={$Title} numberOfLines={2} ellipsizeMode="tail">Click here to read the articles yourself</Text>  
      </Pressable>

      <Pressable onPress={pause} style={$overlay} />

      <Pressable onPress={() => share(item)} style={$shareButtonContainer}>
        <Image source="share" style={$shareButtonImage} />
        <Text style={$shareButtonText}>Share</Text>
      </Pressable>
    </View>
  );
};

export default function HomeScreen() {
  const bottomHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      setPauseOverride(true);
    } else {
      setPauseOverride(false);
    }
  }, [isFocused]);

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
  maxWidth: width * 0.8
};

const $overlayText: TextStyle = {
  color: "#DBE9F4",
  fontSize: 24,
  fontWeight: "bold",
  alignSelf: 'center'
}

const $Title: TextStyle = {
  color: "#DBE9F4",
  fontSize: 16,
  alignSelf: 'left',
  opacity: 0.8
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
