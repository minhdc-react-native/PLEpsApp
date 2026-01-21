import { router } from "expo-router";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, TextInput, useTheme } from "react-native-paper";

export default function PostponeExam() {
    const [reason, setReason] = React.useState("");
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Appbar */}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Hoãn Thi" />
            </Appbar.Header>

            {/* Nội dung */}
            <View style={styles.content}>
                <TextInput
                    label="Lý Do"
                    placeholder="Vì sao bạn hoãn thi?"
                    mode="outlined"
                    value={reason}
                    multiline={true}
                    onChangeText={setReason}
                    style={styles.input}
                />
            </View>

            {/* Nút xác nhận */}
            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={() => {
                        router.back();
                    }}
                    style={styles.confirmButton}
                >
                    Xác Nhận Hoãn Thi
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    input: {
        backgroundColor: "#fff",
        height: 200
    },
    footer: {
        padding: 16,
    },
    confirmButton: {
        backgroundColor: "#B71C1C",
        marginHorizontal: 50,
        marginBottom: 50
    },
});
