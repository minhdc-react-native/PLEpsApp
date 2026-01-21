import { create } from "zustand";

interface IAuth {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  itemData: IDataBase | null;
  setItemData: (itemData: IDataBase | null) => void;
  currentExam: Record<string, any> | null;
  setCurrentExam: (currentExam: Record<string, any> | null) => void;
  totalUnread: number;
  setTotalUnread: (totalUnread: number) => void;
}
export const useData = create<IAuth>((set) => ({
  user: null,
  setUser: (user: IUser | null) => set({ user }),
  itemData: null,
  setItemData: (itemData: IDataBase | null) => set({ itemData }),
  currentExam: null,
  setCurrentExam: (currentExam: Record<string, any> | null) =>
    set({ currentExam }),
  totalUnread: 0,
  setTotalUnread: (totalUnread: number) => set({ totalUnread }),
}));
