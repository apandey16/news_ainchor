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
import Cloudflare from 'cloudflare';

import { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ARTICLE_NAMESPACE_ID, CLOUDFLARE_VIDEO_NAMESPACE_ID, CLOUDFLARE_EMAIL } from "@env";
import moment from "moment";
import { sleep } from "cloudflare/core";

const { height, width } = Dimensions.get("window");

const fetchKVPairVideo = async (key: string): Promise<any | null> => {
  try {
    const client = new Cloudflare({
      apiEmail: CLOUDFLARE_EMAIL, // This is the default and can be omitted
      apiToken: CLOUDFLARE_API_TOKEN // This is the default and can be omitted
    });

    const response = await client.kv.namespaces.values.get(CLOUDFLARE_VIDEO_NAMESPACE_ID, key, { account_id : CLOUDFLARE_ACCOUNT_ID })

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Missing Key for', key);
    return null;
  }
};

const fetchKVPairArticle = async (key: string): Promise<any | null> => {
  try {
    const client = new Cloudflare({
      apiEmail: CLOUDFLARE_EMAIL, // This is the default and can be omitted
      apiToken: CLOUDFLARE_API_TOKEN // This is the default and can be omitted
    });

    const response = await client.kv.namespaces.values.get(CLOUDFLARE_ARTICLE_NAMESPACE_ID, key, { account_id : CLOUDFLARE_ACCOUNT_ID })

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error fetching KV pair:', error);
    return null;
  }
};
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
  articles: any;
  date: string;
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
  articles,
  date
}: VideoWrapper) => {
  const bottomHeight = useBottomTabBarHeight();
  const { index, item } = data;

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
      < Overlay isVisible={overlayVisible} onBackdropPress={overlay} fullScreen={false} backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.50)' }} overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.0)', bottom: "-7%" }}>
        <View>
          <View style={{width: "90%", alignSelf: 'center'}}>
            <Text style={$overlayText}>Enjoy The Articles Yourself!</Text>
            {/* <Text style={$overlayText}>Please Read More! Click any of the links below to read the article we got our information from.</Text> */}
          </View>
            <View style={{ flexDirection: "column", justifyContent: "space-around", opacity: 2, alignSelf: 'center' }}>
                <ArticleCardItem
                title={articles[0].title}
                description={articles[0].description}
                imageUrl={articles[0].imageUrl}
                publisher={articles[0].publisher}
                url={articles[0].url}
                dark={true}
                />
                <ArticleCardItem
                title={articles[1].title}
                description={articles[1].description}
                imageUrl={articles[1].imageUrl}
                publisher={articles[1].publisher}
                url={articles[1].url}
                dark={true}
                />
                <ArticleCardItem
                title={articles[2].title}
                description={articles[2].description}
                imageUrl={articles[2].imageUrl}
                publisher={articles[2].publisher}
                url={articles[2].url}
                dark={true}
                />
            </View>
        </View>
      </Overlay>
      <Pressable onPress={overlay} style={$overlayContainer}>
        <Text style={$Title} numberOfLines={2} ellipsizeMode="tail">{date}</Text>
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


  const [allVideos, setAllVideos] = useState([]);
  const [allArticles, setAllArticles] = useState(["test articles"]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [pauseOverride, setPauseOverride] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  let date = moment();
  if (date.hour() < 10) {
    date = date.subtract(1, "days");
  } else {
    date = date;
  }

  let titleDate = date.format("dddd, MMMM Do YYYY");

  useEffect(() => {
    const fetchVideos = async () => {
      if (isFocused) {
        let attempts = 0;
        const maxAttempts = 3;
        let fetchAttemps = 0;

        while (attempts < maxAttempts) {
          try {
            let result = null;
            while(result === null && fetchAttemps < 3){
              result = await fetchKVPairVideo(date.format("DD-MM-YYYY"));
              if (result === null){
                date = date.subtract(1, "days");
                fetchAttemps++;
              }
            }
            const parsedVideos = JSON.parse(result);
            console.log('Fetched videos:', parsedVideos);
            setAllVideos(parsedVideos);
            break;
          } catch (error) {
            attempts++;
            date.subtract(1, "days");
            if (attempts >= maxAttempts) {
              setAllVideos(["https://stream.mux.com/MOGFOKZRI1nGKrcQnnxSYpK2zqrpHZwvCXLpTaZiueE.m3u8"]);
              console.error('Failed to fetch videos after multiple attempts:', error);
            }
          }
        }
      }
    };
    fetchVideos();
  }, [isFocused]);

  useEffect(() => {
    const fetchArticles = async () => {
      if (isFocused) {
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
          try {
            const result = await fetchKVPairArticle("10-03-2025");
            const parsedArticles = JSON.parse(result);
            setAllArticles(parsedArticles);
            break;
          } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
              console.error('Failed to fetch articles after multiple attempts:', error);
            }
          }
        }
      }
    };
    fetchArticles();
  }, [isFocused]);

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
              articles={allArticles[0]}
              date={titleDate}
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
  bottom: Platform.OS === "android" ? 30 : 50,
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
