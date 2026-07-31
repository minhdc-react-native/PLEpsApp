import { CustomAvatar } from "@/components/avatar";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface PersonSummaryProps {
  name?: string | null;
  imageUrl?: string | null;
  details?: (string | null | undefined)[];
}

export default function PersonSummary({
  name,
  imageUrl,
  details = [],
}: PersonSummaryProps) {
  const { colors } = useTheme();
  const visibleDetails = details.filter(Boolean) as string[];

  return (
    <View style={styles.container}>
      <CustomAvatar src={imageUrl} size={44} />
      <View style={styles.content}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[styles.name, { color: colors.tertiary }]}
        >
          {name || "Chưa cập nhật"}
        </Text>
        {!!visibleDetails.length && (
          <View style={styles.details}>
            {visibleDetails.map((detail, index) => (
              <View key={`${detail}-${index}`} style={styles.detailItem}>
                {index > 0 && (
                  <Text style={[styles.separator, { color: colors.outline }]}>
                    •
                  </Text>
                )}
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[styles.detail, { color: colors.onSurfaceVariant }]}
                >
                  {detail}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
  },
  detail: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    fontSize: 14,
  },
});
