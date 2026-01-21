import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { PanGestureHandler, Pressable, State } from 'react-native-gesture-handler';
import { TextInput, useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

interface PopupContentProps {
    title?: string;
    message?: string;
    backgroundColor?: string;
    textColor?: string;
    iconType?: 'success' | 'warning' | 'error' | 'info' | 'question' | 'none';
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    inputDefaultValue?: string;
    showInput?: boolean;
    onConfirm?: (inputText: string) => void;
    onCanCel?: () => void;
    onClose?: () => void;
    showView?: React.ReactNode | (() => React.ReactNode);
    timeExit?: number;
    color?: string;
}

export const PopupContent = ({
    title,
    message,
    backgroundColor = '#fff',
    textColor = '#000',
    iconType = 'none',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    showCancel = false,
    inputLabel = '',
    inputPlaceholder = '',
    inputDefaultValue = '',
    showInput = false,
    onConfirm,
    onCanCel,
    onClose,
    showView,
    timeExit,
    color
}: PopupContentProps) => {
    const { colors } = useTheme();
    const getIconColor = {
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
        question: "#9C27B0",
        none: colors.primary
    }

    const translateY = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const iconAnim = useRef(new Animated.Value(0)).current;
    const [inputText, setInputText] = useState(inputDefaultValue);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(iconAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose?.();
            return true;
        });

        return () => backHandler.remove();
    }, []);

    const getIcon = () => {
        let iconName: "checkmark-circle" | "warning" | "close-circle" | "information-circle" | "help-circle" | null = null;
        const iconColor = color || getIconColor[iconType];
        switch (iconType) {
            case 'success':
                iconName = 'checkmark-circle';
                break;
            case 'warning':
                iconName = 'warning';
                break;
            case 'error':
                iconName = 'close-circle';
                break;
            case 'info':
                iconName = 'information-circle';
                break;
            case 'question':
                iconName = 'help-circle';
                break;
            default:
                return null;
        }

        return (
            <Animated.View
                style={{
                    transform: [
                        {
                            scale: iconAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                            }),
                        },
                    ],
                    marginBottom: 10,
                }}
            >
                {iconName && <Ionicons name={iconName} size={100} color={iconColor} />}
            </Animated.View>
        );
    };

    // Xử lý vuốt xuống
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: translateY } }],
        { useNativeDriver: true }
    );
    // nếu có timeExit
    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            if (event.nativeEvent.translationY > 100) {
                // Nếu vuốt xuống quá 100px, đóng popup
                Animated.timing(translateY, {
                    toValue: height,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    onClose?.();
                });
            } else {
                // Nếu vuốt chưa đủ xa, reset lại vị trí ban đầu
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        }
    };
    const closeWithAnimation = () => {
        Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose?.();
        });
    };
    useEffect(() => {
        setInputText(inputDefaultValue);
    }, [inputDefaultValue]);

    useEffect(() => {
        if (timeExit) {
            const autoExit: number = setTimeout(() => {
                closeWithAnimation();
            }, (timeExit + 2) * 1000);
            return () => clearTimeout(autoExit);
        }
    }, []);

    return (
        <TouchableWithoutFeedback onPress={closeWithAnimation}>
            <View style={styles.overlay}>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <Animated.View
                        style={[
                            styles.popupContainer,
                            {
                                backgroundColor,
                                transform: [{ translateY }, { scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <View style={styles.dragIndicator} />
                        {typeof showView === 'function' ? showView() : showView ?? (
                            <>
                                <View style={{ alignItems: "center" }}>
                                    {getIcon()}
                                </View>

                                {/* Tiêu đề */}
                                {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}

                                {/* Nội dung */}
                                {message && <Text style={[styles.message, { color: textColor }]}>{message}</Text>}

                                {/* Input */}
                                {showInput && (
                                    <TextInput
                                        mode="outlined"
                                        label={inputLabel}
                                        value={inputText}
                                        onChangeText={setInputText}
                                    />
                                )}
                                {/* Nút xác nhận */}
                                <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                                    {showCancel && <Pressable
                                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                        onPress={() => {
                                            onCanCel?.();
                                            // onClose?.();
                                        }}
                                    >
                                        <Text style={{ padding: 5, borderRadius: 6, borderWidth: 1, borderColor: color || getIconColor[iconType] }}>
                                            {cancelText}
                                        </Text>
                                    </Pressable>}
                                    <Pressable
                                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                        onPress={() => {
                                            onConfirm?.(inputText);
                                            // onClose?.();
                                        }}>
                                        <Text style={{ padding: 5, borderRadius: 6, backgroundColor: color || getIconColor[iconType], borderWidth: 0, color: colors.background }}>
                                            {confirmText}
                                        </Text>
                                    </Pressable>

                                </View>
                            </>)}
                    </Animated.View>
                </PanGestureHandler>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        width,
        height: height + 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        // backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        elevation: 3, // Android
    },
    popupContainer: {
        width: width * 0.8,
        paddingTop: 5,
        paddingHorizontal: 10,
        paddingBottom: 10,
        borderRadius: 10,
        elevation: 5,
        // alignItems: 'center', // Căn giữa nội dung
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
    },
    dragIndicator: {
        width: 50,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 10,
    },
});
