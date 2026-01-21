import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type StarRatingProps = {
    value: number | string; // ví dụ: 3 hoặc '3'
    max?: number; // mặc định 5
    size?: number; // kích thước icon
    colorActive?: string; // màu sao sáng
    colorInactive?: string; // màu sao mờ
    isShowAll?: boolean
};

export const StarRating: React.FC<StarRatingProps> = ({
    value,
    max = 5,
    size = 20,
    colorActive = '#ceb005ff', // vàng
    colorInactive = '#CCCCCC', // xám
    isShowAll = true
}) => {
    const fixValue = Number(value) || 0;
    const rating = Math.max(0, Math.min(fixValue, max));
    return (
        <View style={styles.container}>
            {Array.from({ length: isShowAll ? max : fixValue }).map((_, index) => (
                <MaterialCommunityIcons
                    key={index}
                    name="star"
                    size={size}
                    color={index < rating ? colorActive : colorInactive}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
});
