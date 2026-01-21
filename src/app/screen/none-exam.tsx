import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const NoneExam = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container]}>
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/15399/15399681.png' }}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
            />
            <Text variant="bodyMedium" style={{ color: colors.primary, marginBottom: 8 }}>
                Thông tin kỳ thi
            </Text>
            <Text variant="bodyMedium" style={styles.textCenter}>
                Bạn không có thông tin đợt thi nào!
            </Text>

        </View>
    );
};
export default NoneExam;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    textCenter: {
        textAlign: 'center',
        color: '#555',
    }
});
