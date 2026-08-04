import ExamSvg from "@/assets/images/illustrations/exam.svg";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const NoneExam = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container]}>
            <ExamSvg width={144} height={144} />
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
        color: '#5B667A',
    }
});
