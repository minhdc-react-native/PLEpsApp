import { isNotEmpty } from "@/utils/epsAxios";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { Switch, Text, useTheme } from "react-native-paper";
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types";
interface IProgs {
    label?: string;
    value?: boolean | 'C' | 'K',
    onChange: (value: boolean | 'C' | 'K') => void,
    align?: "left" | "right",
    type?: "checkbox" | 'switch',
    variant?: VariantProp<never> | undefined,
    textStyle?: StyleProp<TextStyle>,
    style?: StyleProp<ViewStyle>;
    color?: string;
    disabled?: boolean;
    isOptionIcon?: boolean; // dùng cho option có icon
}
const VcCheckBox = ({ label, value = false, onChange, textStyle, style, variant, align = "left", type = "checkbox", color, disabled, isOptionIcon }: IProgs) => {
    const { colors } = useTheme();
    const scale = Platform.OS === "ios" ? 0.5 : 1;
    const fixValue = typeof value == "boolean" ? value : value === "C";
    const onChangeValue = () => {
        if (typeof value === "boolean") {
            onChange(!value);
        } else {
            onChange(value === "C" ? 'K' : 'C');
        }
    }
    return (
        <View>
            <Pressable
                onPress={() => !disabled && onChangeValue()}
                style={(pressed) => [{ opacity: pressed ? 0.7 : 1 }, { paddingLeft: label && align === "left" ? 10 : 0, paddingRight: label && align === "left" ? 0 : 10 }]}
            >
                <View style={[styles.rememberMeContainer, style]}>
                    {isNotEmpty(label) && align === "left" && <Text numberOfLines={1} variant={variant}
                        style={[
                            styles.rememberMeText,
                            { flexShrink: 1 },
                            textStyle
                        ]}
                    >
                        {label}
                    </Text>}
                    {type === 'checkbox' ?
                        <MaterialIcons
                            name={fixValue ? (isOptionIcon ? "radio-button-on" : "check-box") :
                                (isOptionIcon ? "radio-button-unchecked" : "check-box-outline-blank")}
                            size={24} color={fixValue ? colors.primary : colors.secondary} /> :
                        <View pointerEvents="none" style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Switch
                                value={fixValue}
                                color={color}
                                style={{ transform: [{ scaleX: scale }, { scaleY: scale }] }}
                            /></View>}
                    {isNotEmpty(label) && align === "right" && <Text numberOfLines={1} variant={variant}
                        style={[
                            styles.rememberMeText,
                            { flexShrink: 1 },
                            textStyle
                        ]}
                    >
                        {label}
                    </Text>}
                </View>
            </Pressable>
        </View>
    );
}
export default VcCheckBox;

const styles = StyleSheet.create({
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between"
    },
    rememberMeText: {
        // fontWeight: "bold"
    },
})