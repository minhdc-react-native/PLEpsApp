import { create } from 'zustand';

interface ITab {
    index: number;
    setIndex: (idx: number) => void;
}
export const useTab = create<ITab>((set) => ({
    index: 0,
    setIndex: (idx: number) =>
        set((state) => ({
            index: idx
        }))
}));