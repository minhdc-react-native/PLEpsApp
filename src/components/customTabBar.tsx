import React from 'react';
import { Divider } from 'react-native-paper';
import { VcTabBar } from './vcTabBar';

export const CustomTabBar = ({ navigationState, setIndex }: any) => {
    const data: any[] = navigationState.routes.map(({ key, title }: any) => ({
        id: key,
        value: title,
    }));
    return (
        <>
            <VcTabBar
                value={data[navigationState.index ?? 0]?.id}
                data={data}
                onPress={(item) => setIndex(data.findIndex(i => i.id === item.id))}
                style={{ borderWidth: 0 }}
            />
            <Divider />
        </>
    );

};
