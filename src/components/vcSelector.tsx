import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const PADDING = 16;

interface IItem {
  id: string | number;
  value: string;
}

interface IProgs {
  data: IItem[];
  value?: string | number | null | undefined;
  onChange?: (value: IItem) => void;
  containerStyle?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  tabBackgroundColor?: string;
  type?: "box" | "line";
  mode?: "fit" | "full";
}

const VcSelector = ({
  data,
  value,
  onChange,
  containerStyle,
  itemStyle,
  tabBackgroundColor,
  type = "line",
  mode = "fit",
}: IProgs) => {
  const { colors } = useTheme();

  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const itemLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const itemWidth = useMemo(() => {
    if (mode === "fit" && data?.length && wrapperWidth) {
      return wrapperWidth / data.length;
    }
    return 0;
  }, [mode, data?.length, wrapperWidth]);

  // index ban đầu theo value (fallback về 0 nếu không tìm thấy)
  const initialIndex = Math.max(
    0,
    data.findIndex((item) => item.id === value)
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const translateX = useSharedValue(
    mode === "fit" ? initialIndex * itemWidth : 0
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const scrollToItem = useCallback(
    (itemId: string | number) => {
      const layout = itemLayouts.current[String(itemId)];
      if (!layout || !viewportWidth) return;

      const targetX = layout.x + layout.width / 2 - viewportWidth / 2;
      scrollRef.current?.scrollTo({
        x: Math.max(0, targetX),
        animated: true,
      });
    },
    [viewportWidth]
  );

  const onSelect = (index: number) => {
    setSelectedIndex(index);
    onChange?.(data[index]);
    scrollToItem(data[index].id);
  };

  // Khi value từ cha đổi -> cập nhật selectedIndex
  useEffect(() => {
    const newIndex = Math.max(
      0,
      data.findIndex((item) => item.id === value)
    );
    setSelectedIndex(newIndex);
  }, [value, data]);

  // TabView can change value from a swipe. Keep the active tab visible even
  // when the user did not tap the tab directly.
  useEffect(() => {
    if (mode !== "full" || value === undefined || value === null) return;
    scrollToItem(value);
  }, [layoutVersion, mode, scrollToItem, value]);

  // Khi selectedIndex hoặc itemWidths đổi -> animate slider
  useEffect(() => {
    if (mode === "fit") {
      translateX.value = withTiming(selectedIndex * itemWidth, {
        duration: 250,
      });
    } else if (itemWidths.length === data.length) {
      const newTranslateX = itemWidths
        .slice(0, selectedIndex)
        .reduce((sum, width) => sum + width, 0);
      translateX.value = withTiming(newTranslateX, { duration: 250 });
    }
  }, [selectedIndex, itemWidth, itemWidths, translateX, mode, data.length]);

  const onWrapperLayout = (e: LayoutChangeEvent) => {
    if (mode === "fit") {
      setWrapperWidth(e.nativeEvent.layout.width);
    }
  };

  const onItemLayout = (itemId: string | number) => (e: LayoutChangeEvent) => {
    if (mode === "full") {
      const { x, width } = e.nativeEvent.layout;
      itemLayouts.current[String(itemId)] = { x, width };
      setLayoutVersion((version) => version + 1);
      setItemWidths((prev) => {
        const index = data.findIndex((item) => item.id === itemId);
        const newWidths = [...prev];
        newWidths[index] = width;
        return newWidths;
      });
    }
  };

  const selectedWidth =
    mode === "fit" ? itemWidth : itemWidths[selectedIndex] || 0;

  return (
    <View
      style={[
        styles.container,
        mode === "full" && styles.fullContainer,
        containerStyle,
      ]}
    >
      {mode === "fit" ? (
        <View
          style={[
            styles.wrapper,
            { backgroundColor: tabBackgroundColor ?? colors.surface },
            type === "box" && { borderRadius: 12 },
          ]}
          onLayout={onWrapperLayout}
        >
          {/* slider */}
          <Animated.View
            style={[
              styles.slider,
              animatedStyle,
              type === "box" && {
                width: selectedWidth,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.primaryContainer,
                backgroundColor: colors.primaryContainer,
              },
            ]}
          >
            {type === "line" && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: selectedWidth,
                }}
              >
                <View
                  style={{
                    height: 2,
                    borderRadius: 2,
                    backgroundColor: colors.primary,
                    marginHorizontal: selectedWidth / 4,
                  }}
                />
              </View>
            )}
          </Animated.View>
          {data.map((item, index) => (
            <Pressable
              key={String(item.id) || String(index)}
              style={[
                styles.item,
                { width: itemWidth },
                itemStyle,
              ]}
              onPress={() => onSelect(index)}
              disabled={itemWidth === 0}
            >
              <Text
                style={[
                  styles.text,
                  { color: colors.onSurface },
                  index === selectedIndex && styles.textActive,
                  index === selectedIndex && { color: colors.primary },
                ]}
                numberOfLines={1}
              >
                {item.value}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          ref={scrollRef}
          onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.wrapper,
              { backgroundColor: tabBackgroundColor ?? colors.surface },
              type === "box" && { borderRadius: 12 },
            ]}
          >
            {/* slider */}
            <Animated.View
              style={[
                styles.slider,
                animatedStyle,
                type === "box" && {
                  width: selectedWidth,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.primaryContainer,
                  backgroundColor: colors.primaryContainer,
                },
              ]}
            >
              {type === "line" && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: selectedWidth,
                  }}
                >
                  <View
                    style={{
                      height: 2,
                      borderRadius: 2,
                      backgroundColor: colors.primary,
                      marginHorizontal: selectedWidth / 4,
                    }}
                  />
                </View>
              )}
            </Animated.View>
            {data.map((item, index) => (
              <Pressable
                key={String(item.id) || String(index)}
                style={[
                  styles.item,
                  itemStyle,
                ]}
                onPress={() => onSelect(index)}
                onLayout={onItemLayout(item.id)}
              >
                <Text
                  style={[
                    styles.text,
                    { color: colors.onSurface },
                    index === selectedIndex && styles.textActive,
                    index === selectedIndex && { color: colors.primary },
                  ]}
                  numberOfLines={1}
                >
                  {item.value}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    marginTop: 12,
  },
  fullContainer: {
    paddingHorizontal: 0,
    marginTop: 0,
  },
  scrollContent: {
    flexDirection: "row",
  },
  wrapper: {
    flexDirection: "row",
    // borderRadius: 5,
    position: "relative",
    overflow: "hidden",
    // Không set width ở đây để nó tự lấy theo cha
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  text: { fontWeight: "500" },
  textActive: {
    fontWeight: "bold",
  },
  slider: {
    position: "absolute",
    height: "100%",
    // borderRadius: 5,
    zIndex: 0,
    // borderWidth: StyleSheet.hairlineWidth,
  },
});

export default VcSelector;
