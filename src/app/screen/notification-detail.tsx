import { useToast } from "@/components/dialog/useToast";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationDetail() {
    const { colors } = useTheme();
    const { showToast } = useToast();
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={30}
                    onPress={() => router.back()}
                />
            </View>
            <Text style={styles.title}>
                Mở đăng ký thi nâng bậc đợt 2/2025
            </Text>
            {/* Time */}
            <Text style={styles.time}>Gửi lúc 10:32, 01/09/2025</Text>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.body}>
                    Xin chào Trần Việt Cường,
                </Text>
                <Text style={styles.body}>
                    Bạn nằm trong danh sách tham gia thi nâng bậc đợt 2/2025 (Tháng 9). Vui lòng xác nhận tham gia thi trong thời gian quy định.
                </Text>
            </View>

            {/* Button */}
            <Button
                mode="contained-tonal"
                style={styles.button}
                labelStyle={{ color: "#000", fontWeight: "bold" }}
                onPress={() => {
                    showToast('Xem chi tiết ???', { type: "info" })
                }}
            >
                Xem Chi Tiết
            </Button>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20
    },
    time: {
        color: "gray",
        marginBottom: 20,
    },
    content: {
        marginBottom: 30,
    },
    body: {
        fontSize: 16,
        marginBottom: 10,
        color: "#000",
    },
    button: {
        borderRadius: 30,
        paddingVertical: 6,
    },
});
