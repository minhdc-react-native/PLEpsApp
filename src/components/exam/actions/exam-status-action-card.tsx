import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

interface Props {
  title: string;
  action?: ReactNode;
  info?: ReactNode;
  children?: ReactNode;
  active?: boolean;
  completed?: boolean;
  subtitle?: string;
  step?: number;
  last?: boolean;
  first?: boolean;
}

export function ExamStatusActionCard({
  title,
  info,
  action,
  active,
  completed,
  children,
  subtitle,
  step,
  last = false,
  first = false,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.stageRow}>
      {!first && (
        <View
          style={[
            styles.leadingConnector,
            {
              backgroundColor:
                active || completed ? colors.tertiary : colors.outlineVariant,
            },
          ]}
        />
      )}
      {!last && (
        <View
          style={[
            styles.connector,
            {
              backgroundColor: completed ? colors.tertiary : colors.outlineVariant,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.stepDot,
          {
            backgroundColor: completed
              ? colors.tertiary
              : active
                ? colors.surface
                : colors.surface,
            borderColor: active ? colors.primary : colors.outlineVariant,
            borderWidth: completed ? 0 : active ? 2 : 1,
          },
        ]}
      >
        {completed ? (
          <Icon source="check" size={16} color="#FFFFFF" />
        ) : active ? (
          <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.headingRow}>
          <View style={styles.titleBlock}>
            <Text
              variant="titleSmall"
              style={{
                fontWeight: "700",
                color: active ? colors.primary : colors.onSurface,
              }}
            >
              {step != null ? `${step}. ${title}` : title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                {subtitle}
              </Text>
            )}
          </View>
          {info}
        </View>

        {children}
        {!completed && action && <View style={styles.action}>{action}</View>}
      </View>
    </View>
  );
}

export const ExamStatusActionCardStyles = StyleSheet.create({
  actionBtnLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});

const styles = StyleSheet.create({
  stageRow: {
    position: "relative",
    flexDirection: "row",
    gap: 10,
    minHeight: 42,
  },
  connector: {
    position: "absolute",
    left: 13,
    top: 28,
    bottom: -14,
    width: 2,
    zIndex: 1,
  },
  leadingConnector: {
    position: "absolute",
    left: 13,
    top: -14,
    height: 28,
    width: 2,
    zIndex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activeDot: { width: 14, height: 14, borderRadius: 7 },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 7,
    paddingBottom: 8,
  },
  headingRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleBlock: { flex: 1, minWidth: 0, gap: 2 },
  subtitle: { fontSize: 12, lineHeight: 16 },
  action: { alignItems: "stretch", paddingTop: 1 },
});
