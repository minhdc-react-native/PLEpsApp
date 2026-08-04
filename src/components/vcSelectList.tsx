import { EvilIcons, FontAwesome } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import debounce from "lodash.debounce";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  ActivityIndicator,
  Divider,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
type IListProps<T = IDataBase> = {
  label?: string;
  placeholder?: string;
  data: T[];
  value: string | number;
  disabled?: boolean;
  fDisplay?: (item: T) => string;
  onChange: (item: T | null) => void;
  typeDisplay?: "value" | "both";
  fId?: string;
  fValue?: string;
  clean?: boolean; // nếu true thì có nút xóa
  rightIcon?: React.ReactNode; // nếu có thì hiển thị icon bên phải
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  isError?: boolean;
  notFistFilter?: boolean;
  checkSelected?: { isError: string; message: string; requiredKeys: string[] };
};

function ViewComponent<T = IDataBase>({
  label,
  placeholder,
  data,
  value,
  onChange,
  fDisplay,
  typeDisplay = "value",
  disabled = false,
  fId,
  fValue,
  clean = true,
  rightIcon,
  style,
  loading,
  isError,
  notFistFilter = true,
  checkSelected,
}: IListProps<T>) {
  fId = fId || "id";
  fValue = fValue || "value";

  const colors = useTheme().colors;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "70%", "90%"], []);
  const [searchText, setSearchText] = useState("");
  const [itemSelected, setItemSelected] = useState<T | null>(
    data.find((item: any) => item[fId] === value) || null
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((txt: string) => {
        setSearchText(txt);
      }, 300),
    []
  );

  const filteredList = useMemo(() => {
    if (!searchText) return data;
    const _searchText = searchText.toLowerCase();
    return data.filter(
      (item: any) =>
        item[fId].toString().toLowerCase().includes(_searchText) ||
        item[fValue].toLowerCase().includes(_searchText)
    );
  }, [searchText, data, fId, fValue]);

  const openModalSelect = () => {
    if (disabled) return;
    Keyboard.dismiss();
    bottomSheetRef.current?.snapToIndex(2);
  };
  const getItemSelected = (item: T | null) => {
    bottomSheetRef.current?.close();
    onChange(item);
    if ((itemSelected as any)?.[fId] !== value) setItemSelected(item);
  };
  useEffect(() => {
    if (value) {
      const selectedItem = data.find((item: any) => item[fId] === value);
      setItemSelected(selectedItem || null);
    } else {
      setItemSelected(null);
    }
  }, [value, data, fId]);

  useEffect(() => {
    if (notFistFilter) return;
    setSearchText(value?.toString());
  }, [notFistFilter, value]);
  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            opacity: pressed ? 0.7 : 1,
            borderColor: isError ? colors.error : colors.outline,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        // pressStyle={{
        //     backgroundColor: colors.background, justifyContent: "space-between", flexDirection: "row", alignItems: "center",
        //     paddingVertical: 10, paddingHorizontal: 20, gap: 10, borderRadius: 6
        // }}
        onPress={openModalSelect}
      >
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size={20} color={colors.backdrop} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text
              variant="bodyLarge"
              numberOfLines={1}
              style={{
                color: itemSelected
                  ? disabled
                    ? colors.onSurfaceVariant
                    : colors.onSurface
                  : colors.onSurfaceVariant,
              }}
            >
              {itemSelected
                ? fDisplay
                  ? fDisplay(itemSelected)
                  : typeDisplay !== "both"
                  ? (itemSelected as any)[fValue] ?? "???"
                  : ""
                      .concat((itemSelected as any)[fId] ?? "???", " - ")
                      .concat((itemSelected as any)[fValue] ?? "???")
                : placeholder || label || `Chọn...`}
            </Text>
          </View>
        )}
        {itemSelected && clean && !disabled ? (
          rightIcon || (
            <Pressable
              onPress={(event) => {
                event.stopPropagation(); // Ngăn sự kiện lan lên cha
                getItemSelected(null);
              }}
              style={{ right: -15 }}
            >
              <IconButton
                icon="close-circle"
                size={15}
                iconColor={colors.primary}
              />
            </Pressable>
          )
        ) : (
          <FontAwesome name="angle-down" size={20} color={colors.secondary} />
        )}
        {itemSelected && label && (
          <View style={[styles.label, { backgroundColor: colors.background }]}>
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1} // đóng mặc định
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1} // khi index = -1 (đóng) thì backdrop biến mất
              appearsOnIndex={0} // khi index >= 0 thì backdrop hiện ra
              opacity={0.5} // độ mờ
            />
          )}
          enableContentPanningGesture={true}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          containerStyle={{ marginTop: 60 }}
        >
          <HeaderView
            setSearchText={debouncedSearch}
            txtSearch={notFistFilter ? "" : value?.toString()}
            label={label || placeholder}
          />
          <BottomSheetFlatList
            data={filteredList}
            keyExtractor={(item: any) => item[fId].toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }: { item: any; index: number }) => (
              <ItemView
                item={item}
                onPress={getItemSelected as (item: any) => void}
                isSelect={item[fId] === (itemSelected as any)?.[fId]}
                fId={fId}
                fValue={fValue}
                fDisplay={fDisplay as ((item: any) => string) | undefined}
              />
            )}
            ItemSeparatorComponent={() => <Divider />}
            keyboardShouldPersistTaps="always"
            ListFooterComponent={() => <View style={{ height: 50 }} />}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </BottomSheet>
      </Portal>
    </>
  );
}

const VcSelectList = React.memo(ViewComponent) as typeof ViewComponent;
export default VcSelectList;
type IProps<T = any> = {
  item: T;
  onPress: (item: T) => void;
  isSelect?: boolean;
  fId: string;
  fValue: string;
  fDisplay?: (item: T) => string;
};

const ItemViewComponent = <T = any,>({
  item,
  onPress,
  isSelect,
  fId,
  fValue,
  fDisplay,
}: IProps<T>) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        onPress(item);
      }}
      style={{
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isSelect ? colors.elevation.level1 : "transparent",
      }}
    >
      <View
        style={{
          paddingVertical: 10,
          paddingLeft: 10,
          paddingHorizontal: 10,
          flex: 1,
        }}
      >
        <Text>{fDisplay ? fDisplay(item) : `${(item as any)[fValue]}`}</Text>
      </View>
    </Pressable>
  );
};
const ItemView = React.memo(ItemViewComponent);

const HeaderView = ({
  setSearchText,
  txtSearch,
  label,
}: {
  setSearchText: (value: string) => void;
  txtSearch?: string;
  label?: string;
}) => {
  label = label || "Chọn";
  const [valueSearch, setValueSerach] = useState(txtSearch);
  const { colors } = useTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        flexDirection: "row",
        paddingLeft: 20,
        paddingRight: 10,
        gap: 5,
        alignItems: "center",
        borderBottomWidth: 0.4,
        paddingBottom: 10,
        borderBottomColor: colors.backdrop,
      }}
    >
      <View style={{ maxWidth: "30%" }}>
        <Text
          variant="titleSmall"
          numberOfLines={1}
          style={{ alignSelf: "center", marginRight: 10 }}
        >
          {label}
        </Text>
      </View>
      <TextInput
        placeholder={"Tìm kiếm"}
        mode="outlined"
        left={
          <TextInput.Icon
            icon={() => (
              <EvilIcons name="search" size={24} color={colors.secondary} />
            )}
          />
        }
        right={
          valueSearch ? (
            <TextInput.Icon
              icon={"close"}
              color={colors.primary}
              onPress={() => {
                if (!valueSearch) return;
                setValueSerach("");
                setSearchText("");
              }}
            />
          ) : undefined
        }
        value={valueSearch}
        onChangeText={(value) => {
          setValueSerach(value);
          setSearchText(value);
        }}
        outlineStyle={{
          padding: 0,
          margin: 0,
          borderWidth: 0.5,
          borderRadius: 20,
          borderColor: colors.backdrop,
        }}
        style={{ flex: 1, height: 40 }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    height: 56,
  },
  label: {
    position: "absolute",
    paddingHorizontal: 4,
    top: -8,
    left: 8,
    zIndex: 2,
  },
});
