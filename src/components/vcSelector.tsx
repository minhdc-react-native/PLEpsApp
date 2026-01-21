import React, { useEffect, useMemo, useState } from "react";
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
  type?: "box" | "line";
  mode?: "fit" | "full";
}

const VcSelector = ({
  data,
  value,
  onChange,
  containerStyle,
  itemStyle,
  type = "line",
  mode = "fit",
}: IProgs) => {
  const { colors } = useTheme();

  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);

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

  const onSelect = (index: number) => {
    setSelectedIndex(index);
    onChange?.(data[index]);
  };

  // Khi value từ cha đổi -> cập nhật selectedIndex
  useEffect(() => {
    const newIndex = Math.max(
      0,
      data.findIndex((item) => item.id === value)
    );
    setSelectedIndex(newIndex);
  }, [value, data]);

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

  const onItemLayout = (index: number) => (e: LayoutChangeEvent) => {
    if (mode === "full") {
      const width = e.nativeEvent.layout.width;
      setItemWidths((prev) => {
        const newWidths = [...prev];
        newWidths[index] = width;
        return newWidths;
      });
    }
  };

  const selectedWidth =
    mode === "fit" ? itemWidth : itemWidths[selectedIndex] || 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {mode === "fit" ? (
        <View
          style={[
            styles.wrapper,
            { backgroundColor: colors.background },
            type === "box" && { borderRadius: 5 },
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
                borderRadius: 5,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.primary,
                backgroundColor: colors.elevation.level2,
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
                mode === "fit" ? { width: itemWidth } : {},
                itemStyle,
              ]}
              onPress={() => onSelect(index)}
              disabled={mode === "fit" && itemWidth === 0}
              onLayout={mode === "full" ? onItemLayout(index) : undefined}
            >
              <Text
                style={[
                  styles.text,
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
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.wrapper,
              { backgroundColor: colors.background },
              type === "box" && { borderRadius: 5 },
            ]}
          >
            {/* slider */}
            <Animated.View
              style={[
                styles.slider,
                animatedStyle,
                type === "box" && {
                  width: selectedWidth,
                  borderRadius: 5,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.primary,
                  backgroundColor: colors.elevation.level2,
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
                  mode === "fit" ? { width: itemWidth } : {},
                  itemStyle,
                ]}
                onPress={() => onSelect(index)}
                disabled={mode === "fit" && itemWidth === 0}
                onLayout={mode === "full" ? onItemLayout(index) : undefined}
              >
                <Text
                  style={[
                    styles.text,
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
  text: {
    color: "#333",
    fontWeight: "500",
  },
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
