import React, { createContext, useContext, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import PieLoader from "./pieLoader";

const LoadingContext = createContext<{
    show: (text?: string) => void;
    hide: () => void;
}>({
    show: (text?: string) => { },
    hide: () => { },
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState("");
    const show = (text?: string) => {
        setText(text ?? "");
        setVisible(true)
    };
    const hide = () => setVisible(false);

    return (
        <LoadingContext.Provider value={{ show, hide }}>
            {children}
            {visible && (
                <View style={[styles.overlayView, { backgroundColor: colors.backdrop }]}>
                    <View style={{ gap: 5, alignItems: "center" }}>
                        <PieLoader />
                        {/* <Text style={{ color: "#fff" }}>{text}</Text> */}
                    </View>
                </View>
            )}
        </LoadingContext.Provider>
    );
};
const { width, height } = Dimensions.get("screen");
const styles = StyleSheet.create({
    overlayView: {
        left: 0, top: 0,
        width: width,
        height: height + 100,
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
    }
});
