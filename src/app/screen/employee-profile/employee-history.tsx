import { ListFields } from "@/components/detail-fields/list-fields";
import { Field } from "@/components/Field";
import { useData } from "@/hooks/zustand/useData";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function EmployeeHistory() {
  const user = useData((state) => state.user);
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={[styles.container]}>
        <ListFields>
          <Field label="Ghi chú" value={user?.note} />
          <Field label="Quá trình công tác" value={user?.workHistory} />
        </ListFields>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
