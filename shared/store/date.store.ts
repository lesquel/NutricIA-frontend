/**
 * Global date state — shared across Dashboard, Journal & Analytics.
 */

import { create } from 'zustand';

type DateStore = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  goToToday: () => void;
};

export const useDateStore = create<DateStore>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  goToToday: () => set({ selectedDate: new Date() }),
}));

/** Format a Date as YYYY-MM-DD (for API calls). */
export function formatDateParam(date: Date): string {
  return date.toISOString().split('T')[0];
}
