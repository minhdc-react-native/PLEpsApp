import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Card, Text, useTheme } from "react-native-paper";

export default function GuideExam() {
    const { colors } = useTheme();
    const items = [
        {
            id: 1,
            icon: "star",
            title: "Thi Nâng Bậc",
            subtitle: "Quy định & Điều kiện",
        },
        {
            id: 2,
            icon: "star-outline",
            title: "Thi Giữ Bậc",
            subtitle: "Quy định & Điều kiện",
        },
        {
            id: 3,
            icon: "briefcase-outline",
            title: "Thi Kiểm Tra Sát Hoạch Nghề",
            subtitle: "Quy định & Điều kiện",
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Appbar */}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Hướng dẫn thi" />
            </Appbar.Header>

            {/* Danh sách các mục */}
            <View style={{ padding: 16 }}>
                {items.map((item) => (
                    <TouchableOpacity key={item.id} style={{ marginBottom: 12 }} onPress={() => router.navigate("/screen/guide-exam-detail")}>
                        <Card style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
                            <Card.Content style={styles.cardContent}>
                                {/* Icon */}
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons
                                        name={item.icon as any}
                                        size={22}
                                        color={colors.primary}
                                    />
                                </View>

                                {/* Text */}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                                    <Text style={styles.title}>{item.title}</Text>
                                </View>

                                {/* Arrow */}
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color="gray"
                                />
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },
    subtitle: {
        fontSize: 12,
        color: "gray",
        marginBottom: 2,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
    },
});
