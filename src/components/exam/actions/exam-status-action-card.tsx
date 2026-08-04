import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Icon, Text, useTheme } from "react-native-paper";

interface Props {
  title: string;
  action?: ReactNode;
  info?: ReactNode;
  children?: ReactNode;
  active?: boolean;
  icon?: string;
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
  children,
  icon = "clipboard-text-outline",
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
          style={[styles.leadingConnector, { backgroundColor: colors.outlineVariant }]}
        />
      )}
      {!last && (
        <View
          style={[styles.connector, { backgroundColor: colors.outlineVariant }]}
        />
      )}
      <View
        style={[
          styles.stepDot,
          {
            backgroundColor: active ? colors.primary : colors.surfaceVariant,
            borderWidth: active ? 0 : 1,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        {step !== undefined ? (
          <Text
            style={{
              color: active ? colors.onPrimary : colors.onSurfaceVariant,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            {step}
          </Text>
        ) : (
          <Icon
            source="check"
            size={16}
            color={active ? colors.onPrimary : colors.onSurfaceVariant}
          />
        )}
      </View>

      <Card
        mode="contained"
        style={[
          styles.card,
          {
            borderColor: active ? colors.primary : colors.outlineVariant,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.headingRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: active
                    ? colors.primaryContainer
                    : colors.surfaceVariant,
                },
              ]}
            >
              <Icon
                source={icon}
                size={24}
                color={active ? colors.primary : colors.onSurfaceVariant}
              />
            </View>
            <View style={styles.titleBlock}>
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: "700",
                  color: active ? colors.primary : colors.onSurface,
                }}
              >
                {title}
              </Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {info && <View style={styles.statusRow}>{info}</View>}
          {children}
          {action && <View style={styles.action}>{action}</View>}
        </View>
      </Card>
    </View>
  );
}

export const ExamStatusActionCardStyles = StyleSheet.create({
  actionBtnLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});

const styles = StyleSheet.create({
  stageRow: {
    position: "relative",
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
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginLeft: 44,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  stepDot: {
    position: "absolute",
    left: 0,
    top: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusRow: {
    alignItems: "flex-end",
    minHeight: 22,
  },
  action: {
    paddingTop: 2,
    alignItems: "stretch",
  },
});
