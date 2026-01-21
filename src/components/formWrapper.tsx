
import React from 'react';
import {
    ColorValue,
    Platform,
    RefreshControlProps,
    StyleSheet,
    ViewStyle
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Giúp form không bị che bởi bàn phím
import { useTheme } from 'react-native-paper';
interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
    refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>> | undefined;
    backgroundColor?: ColorValue | undefined;
}

export default function FormWrapper({ children, style, refreshControl, backgroundColor }: Props) {
    const { colors } = useTheme();
    return (
        <KeyboardAwareScrollView
            style={{ backgroundColor: backgroundColor || colors.background }}
            contentContainerStyle={[styles.scrollContainer, { backgroundColor: backgroundColor || colors.background }, style]}
            enableOnAndroid={true}
            extraScrollHeight={Platform.OS === 'android' ? 80 : 40}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
        >
            {children}
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        marginBottom: Platform.OS === 'android' ? 50 : 20,
    }
});
