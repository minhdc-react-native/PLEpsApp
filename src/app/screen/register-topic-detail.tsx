import { usePopup } from "@/components/dialog/popupProvider";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Text, useTheme } from "react-native-paper";

const RegisterTopicDetail = () => {
    const { sTopic } = useLocalSearchParams();
    const topic = sTopic ? JSON.parse(sTopic.toString()) : {};
    const { showPopup } = usePopup();
    const { colors } = useTheme();
    const descriptionList = [
        "Tờ trình",
        "Hạng mục công việc chính",
        "Tiến độ dự kiến",
        "Thời gian làm việc",
        "Sơ đồ bố trí nhân sự",
        "Vật tư",
        "Dụng cụ",
        "Phương án kỹ thuật",
        "Hồ sơ QC - HSE",
        "Hậu cần",
        "Công tác phối hợp (trong nội bộ EPS và giữa EPS - DVPD)",
        "Đánh giá kết quả thực hiện",
        "Các biểu mẫu, biên bản",
        "Báo cáo kết quả thực hiện",
    ];

    return (
        <View style={{ flex: 1, marginBottom: 50 }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Đăng Ký Đề Tài - NB Đợt 2/2025" />
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Đề Tài</Text>
                <Text style={styles.topicTitle}>{topic?.title}</Text>

                <Text style={styles.label}>Mô Tả</Text>
                {descriptionList.map((item, index) => (
                    <Text key={index} style={styles.description}>
                        {index + 1}. {item}
                    </Text>
                ))}
            </ScrollView>
            <View style={styles.footer}>
                <Button mode="contained" style={{ alignSelf: "center" }} contentStyle={{ paddingHorizontal: 50 }} onPress={() => {
                    showPopup({
                        message: 'Bạn có muốn đăng ký đề tài này không?',
                        showCancel: true,
                        cancelText: "Không",
                        confirmText: "Có đăng ký",
                        onConfirm: () => {
                            router.back();
                        },
                        iconType: "question",
                        color: colors.primary
                    })
                }}>
                    Đăng Ký
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginTop: 12,
        marginBottom: 4,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        marginVertical: 2,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
});

export default RegisterTopicDetail;
