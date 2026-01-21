import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Appbar, Card, Chip, Divider, useTheme } from "react-native-paper";

const GuideExamDetail = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: "#F5F8F9" }}>
            {/* Header */}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Thi Nâng Bậc" />
                <Appbar.Action icon="star-outline" onPress={() => { }} />
            </Appbar.Header>

            {/* Content */}
            <ScrollView>
                <View style={{ backgroundColor: colors.background, paddingHorizontal: 30, paddingTop: 10 }}>
                    <Text style={styles.sectionTitle}>Quy định & Điều kiện</Text>

                    <Text style={styles.description}>
                        Công nhân viên / Người lao động xét thi nâng bậc thuộc 1 trong 2 trường hợp sau:
                    </Text>

                    <View style={styles.conditionRow}>
                        <Chip style={[styles.chip, { backgroundColor: colors.elevation.level1 }]} textStyle={{ color: colors.primary }}>TH1</Chip>
                        <Text style={styles.conditionText}>Đạt đủ điều kiện 1 + 2 + 3</Text>
                    </View>

                    <Text style={styles.orText}>hoặc</Text>

                    <View style={styles.conditionRow}>
                        <Chip style={[styles.chip, { backgroundColor: colors.elevation.level1 }]} textStyle={{ color: colors.primary }}>TH2</Chip>
                        <Text style={styles.conditionText}>Đạt điều kiện 4</Text>
                    </View>
                    <Divider />
                </View>
                {/* Điều kiện */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Điều kiện 1</Text>
                        <Text style={styles.cardText}>
                            Không thực hiện rút ngắn thời gian giữ bậc hai lần liên tiếp - 02 bậc liên kề trong cùng chức danh
                        </Text>
                        <Text style={styles.cardNote}>
                            Phạm vi áp dụng: Từ bậc 1/7 đến 7/7, từ bậc 1/5 đến 5/5.
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Điều kiện 2</Text>
                        <Text style={styles.cardText}>
                            Không thực hiện rút ngắn thời gian giữ bậc hai lần liên tiếp - 02 bậc liên kề trong cùng chức danh
                        </Text>
                        <Text style={styles.cardNote}>
                            Phạm vi áp dụng: Từ bậc 1/7 đến 7/7, từ bậc 1/5 đến 5/5.
                        </Text>
                    </Card.Content>
                </Card>
                {/* Điều kiện */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Điều kiện 3</Text>
                        <Text style={styles.cardText}>
                            Không thực hiện rút ngắn thời gian giữ bậc hai lần liên tiếp - 02 bậc liên kề trong cùng chức danh
                        </Text>
                        <Text style={styles.cardNote}>
                            Phạm vi áp dụng: Từ bậc 1/7 đến 7/7, từ bậc 1/5 đến 5/5.
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Điều kiện 4</Text>
                        <Text style={styles.cardText}>
                            Không thực hiện rút ngắn thời gian giữ bậc hai lần liên tiếp - 02 bậc liên kề trong cùng chức danh
                        </Text>
                        <Text style={styles.cardNote}>
                            Phạm vi áp dụng: Từ bậc 1/7 đến 7/7, từ bậc 1/5 đến 5/5.
                        </Text>
                    </Card.Content>
                </Card>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Điều kiện 5</Text>
                        <Text style={styles.cardText}>
                            Không thực hiện rút ngắn thời gian giữ bậc hai lần liên tiếp - 02 bậc liên kề trong cùng chức danh
                        </Text>
                        <Text style={styles.cardNote}>
                            Phạm vi áp dụng: Từ bậc 1/7 đến 7/7, từ bậc 1/5 đến 5/5.
                        </Text>
                    </Card.Content>
                </Card>
                {/* Điều kiện */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Điều kiện 6</Text>
                        <Text style={styles.cardText}>
                            Không thực hiện rút ngắn thời gian giữ bậc hai lần liên tiếp - 02 bậc liên kề trong cùng chức danh
                        </Text>
                        <Text style={styles.cardNote}>
                            Phạm vi áp dụng: Từ bậc 1/7 đến 7/7, từ bậc 1/5 đến 5/5.
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Điều kiện 7</Text>
                        <Text style={styles.cardText}>
                            Không thực hiện rút ngắn thời gian giữ bậc hai lần liên tiếp - 02 bậc liên kề trong cùng chức danh
                        </Text>
                        <Text style={styles.cardNote}>
                            Phạm vi áp dụng: Từ bậc 1/7 đến 7/7, từ bậc 1/5 đến 5/5.
                        </Text>
                    </Card.Content>
                </Card>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 14,
        color: "#7A7A7A",
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        marginBottom: 12,
    },
    conditionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    chip: {
        marginRight: 8,
    },
    conditionText: {
        fontSize: 15,
        color: "#333",
    },
    orText: {
        textAlign: "center",
        marginVertical: 8,
        fontSize: 14,
        color: "#666",
    },
    card: {
        marginHorizontal: 20,
        marginTop: 12,
        borderRadius: 12,
        backgroundColor: "white",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    cardText: {
        fontSize: 14,
        color: "#333",
        marginBottom: 6,
    },
    cardNote: {
        fontSize: 13,
        color: "#555",
        fontWeight: "600",
    },
});

export default GuideExamDetail;
