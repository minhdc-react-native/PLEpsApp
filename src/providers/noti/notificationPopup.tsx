import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions, Pressable } from 'react-native';
import { customText, useTheme } from 'react-native-paper';
const Text = customText<'customVariant'>();

interface NotificationPopupProps {
    title?: string | null | undefined;
    message?: string | null | undefined;
    onHide?: () => void;
    duration?: number;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ title, message, onHide, duration = 3000 }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const { colors } = useTheme();
    useEffect(() => {
        // Slide in
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Slide out
        const timeout = setTimeout(() => {
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                onHide?.();
            });
        }, duration);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable onPress={onHide}>
                <View style={[styles.popup, { backgroundColor: colors.secondary, width: Dimensions.get('window').width - 40 }]}>
                    <Text variant='titleSmall' style={{ fontWeight: "bold", color: "#fff" }}>{title}</Text>
                    <Text variant='titleSmall' style={{ color: "#fff" }}>{message}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        width: Dimensions.get('window').width,
        alignItems: 'center',
        zIndex: 1000,
        elevation: 1000,
    },
    popup: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    }
});

export default NotificationPopup;
