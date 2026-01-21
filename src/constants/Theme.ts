import {
    MD3LightTheme as DefaultTheme,
} from 'react-native-paper';

const ThemeCustomize = {
    primary: 'rgb(0, 106, 106)',          // màu nút chính (Đăng ký thi)
    onPrimary: 'rgb(255, 255, 255)',      // màu chữ trên nút
    primaryContainer: 'rgb(143, 233, 232)', // nền nhạt khi có container
    onPrimaryContainer: 'rgb(0, 32, 32)',

    secondary: 'rgb(74, 99, 99)',         // màu tab & icon nhạt
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(204, 232, 231)',
    onSecondaryContainer: 'rgb(5, 32, 32)',

    tertiary: 'rgb(69, 94, 123)',         // màu phụ cho hình minh họa
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(204, 227, 255)',
    onTertiaryContainer: 'rgb(0, 27, 51)',

    error: 'rgb(186, 26, 26)',            // màu "Hoãn thi?"
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',

    background: 'rgb(250, 253, 253)',     // nền chính
    onBackground: 'rgb(25, 28, 28)',
    surface: 'rgb(250, 253, 253)',
    onSurface: 'rgb(25, 28, 28)',

    surfaceVariant: 'rgb(218, 229, 228)',
    onSurfaceVariant: 'rgb(63, 73, 72)',
    outline: 'rgb(111, 121, 120)',
    outlineVariant: 'rgb(190, 201, 200)',

    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(46, 49, 49)',
    inverseOnSurface: 'rgb(239, 241, 240)',
    inversePrimary: 'rgb(111, 212, 211)',

    elevation: {
        level0: 'transparent',
        level1: 'rgb(238, 246, 246)',
        level2: 'rgb(230, 241, 241)',
        level3: 'rgb(222, 237, 237)',
        level4: 'rgb(219, 236, 236)',
        level5: 'rgb(214, 233, 233)',
    },

    surfaceDisabled: 'rgba(25, 28, 28, 0.12)',
    onSurfaceDisabled: 'rgba(25, 28, 28, 0.38)',
    backdrop: 'rgba(42, 50, 50, 0.4)',
}
const ThemeEvnGenco3 = {
    primary: "#0000AA",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D0D0FF",
    onPrimaryContainer: "#00006E",

    secondary: "#565680",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#DDE0FF",
    onSecondaryContainer: "#12134A",

    tertiary: "#006494",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#CBE6FF",
    onTertiaryContainer: "#001E30",
    error: "#BA1A1A",
    onError: "#FFFFFF",
    errorContainer: "#FFDAD6",
    onErrorContainer: "#410002",

    background: "#FDFCFF",
    onBackground: "#1B1B21",
    surface: "#FDFCFF",
    onSurface: "#1B1B21",

    surfaceVariant: "#E2E0F0",
    onSurfaceVariant: "#454559",
    outline: "#767680",
    outlineVariant: "#C6C5D0",

    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#2F3035",
    inverseOnSurface: "#F2F0F7",
    inversePrimary: "#A9A9FF",

    elevation: {
        level0: "transparent",
        level1: "#F0F0FF",
        level2: "#E6E6FF",
        level3: "#DDDDFF",
        level4: "#D9D9FF",
        level5: "#D3D3FF",
    },

    surfaceDisabled: "rgba(27, 27, 33, 0.12)",
    onSurfaceDisabled: "rgba(27, 27, 33, 0.38)",
    backdrop: "rgba(41, 41, 70, 0.4)",
}

export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        ...ThemeEvnGenco3
    },
};