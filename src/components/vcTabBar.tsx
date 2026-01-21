import { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";
interface IData {
    id: string | number;
    [key: string]: any;
}

interface IProgs {
    value: string | number | null,
    data: IData[],
    onPress: (value: IData) => void,
    style?: StyleProp<ViewStyle>;
}
export const VcTabBar = ({ value, data, onPress, style }: IProgs) => {

    const { colors } = useTheme();
    const tabLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});
    const scrollRef = useRef<ScrollView>(null);
    const [widthView, setWidthView] = useState<number>(0);
    const setScroll = (item: IData) => {
        const layout = tabLayouts.current[item.id];
        const scrollView = scrollRef.current;
        if (layout && scrollView) {
            const { x, width } = layout;
            const targetScrollX = x + width / 2 - widthView / 2;
            scrollView.scrollTo({ x: Math.max(0, targetScrollX), animated: true });
        }
    }
    const onTabPress = (item: IData) => {
        onPress(item);
        setScroll(item);
    };
    const [layoutReady, setLayoutReady] = useState(false);

    useEffect(() => {
        if (value && layoutReady) {
            const item = data.find(i => i.id === value);
            if (item) setScroll(item);
        }
    }, [value, layoutReady]);

    return (
        <View style={[{ backgroundColor: colors.background, borderWidth: 0.5, borderColor: colors.backdrop, borderBottomWidth: 1, borderBottomColor: colors.primary }, style]} onLayout={(event: LayoutChangeEvent) => {
            const { x, width } = event.nativeEvent.layout;
            setWidthView(width);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setLayoutReady(true);
                }, 10); // Đợi 1 chút để nội dung thực sự hiển thị
            });
        }}>
            <ScrollView
                horizontal
                ref={scrollRef}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.tabBarScroll]}
            >
                {data.map((item, i) => {
                    const isFocused = item.id === value;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.tabItem, isFocused && { backgroundColor: colors.primary }]}
                            onPress={() => onTabPress(item)}
                            onLayout={(event: LayoutChangeEvent) => {
                                const { x, width } = event.nativeEvent.layout;
                                tabLayouts.current[item.id] = { x, width };
                            }}
                        >
                            <Text numberOfLines={1} variant="titleSmall" style={[styles.tabText,
                            isFocused && [styles.activeTabText, { color: colors.background }]]}>
                                {item.value}
                            </Text>
                            {!!item.badge && <Text style={[
                                styles.badge,
                                isFocused ? { backgroundColor: colors.background, color: colors.secondary } : { backgroundColor: colors.backdrop, color: colors.background }
                            ]}>{getTextBadge(Number(item.badge))}</Text>}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
const getTextBadge = (badge: number) => {
    return badge < 100 ? badge.toString() : '99+';
}
const styles = StyleSheet.create({
    badge: {
        fontSize: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10
    },
    tabBarScroll: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
    },
    tabItem: {
        // marginHorizontal: 10,
        // marginVertical: 8,
        paddingHorizontal: 10,
        alignItems: 'center',
        // borderRadius: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        // maxWidth: 120,
        gap: 5,
        flexDirection: "row"
    },
    tabText: {
        flexShrink: 1,
        // fontSize: 18,
        paddingVertical: 5,
        color: '#999'
    },
    activeTabText: {
        // fontWeight: 'bold',
        // fontSize: 15,
        textAlign: "center",
        // paddingHorizontal: 5,
        // paddingVertical: 2,
        // borderRadius: 10
    },
});