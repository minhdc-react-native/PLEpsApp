import React, { useState } from "react";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
interface IProg {
    style?: StyleProp<ViewStyle>
}
export default function LoadingScreen({ style }: IProg) {
    const { colors } = useTheme();
    const [size, setSize] = useState({ width: 0, height: 0 });

    return (
        <View
            style={[{ marginTop: 50, marginHorizontal: 20 }, style]}
            onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setSize({ width, height: height || 200 }); // fallback height
            }}
        >
            {size.width > 0 && (
                <ContentLoader
                    speed={1}
                    width={size.width}
                    height={size.height}
                    viewBox={`0 0 ${size.width} ${size.height}`}
                    backgroundColor={colors.outlineVariant}
                    foregroundColor="#ecebeb"
                >
                    <Rect x="48" y="8" rx="3" ry="3" width="80%" height="10" />
                    <Rect x="48" y="26" rx="3" ry="3" width="52" height="10" />
                    <Rect x="0" y="56" rx="3" ry="3" width={size.width - 30} height="10" />
                    <Rect x="0" y="72" rx="3" ry="3" width={size.width - 60} height="10" />
                    <Rect x="0" y="88" rx="3" ry="3" width="178" height="10" />
                    <Circle cx="20" cy="20" r="20" />
                </ContentLoader>
            )}
        </View>
    );
}
