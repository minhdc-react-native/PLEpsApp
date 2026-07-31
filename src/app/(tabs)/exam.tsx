import useCurrentExam from "@/hooks/useCurrentExam";
import { useData } from "@/hooks/zustand/useData";
import { useEffect } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import ExamRegistrationScreen from "../screen/current-exam";
import NoneExam from "../screen/none-exam";

const CurrentExamPage = () => {
  const currentExam = useData((state) => state.currentExam);
  const { refetch, loading } = useCurrentExam();
  const { colors } = useTheme();
  useEffect(() => {
    // fetch current exam on mount
    refetch();
  }, [refetch]);

  if (loading) return null;

  return (
    <ScrollView
      contentContainerStyle={
        !currentExam && {
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }
      }
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {currentExam ? (
        <ExamRegistrationScreen />
      ) : (
        <NoneExam />
      )}
    </ScrollView>
  );
};

export default CurrentExamPage;
