import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PatternType } from '@/components/PatternOverlay';

// Helper for UUID if package not available, but 'uuid' is standard. 
// I'll stick to crypto.randomUUID() if environment supports it (Next.js usually does in modern Node/Browsers).
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};

export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface Habit {
    id: string;
    name: string;
    frequency: FrequencyType;
    color: string;
    pattern: PatternType;
    createdAt: string;
    archived: boolean;
}

export interface CheckIn {
    completed: boolean;
    note?: string;
    timestamp: number;
}

// Map habitId -> dateString (YYYY-MM-DD) -> CheckIn
export type CheckInsMap = Record<string, Record<string, CheckIn>>;

// Enhanced CheckIn with numeric value for heatmap
export interface CheckIn {
    completed: boolean;
    value?: number; // Added for heatmap intensity (reps)
    note?: string;
    timestamp: number;
}

export interface Habit {
    id: string;
    name: string;
    frequency: FrequencyType;
    color: string;
    theme?: string; // Added for heatmap theme (blue, green, etc.)
    pattern: PatternType;
    createdAt: string;
    archived: boolean;
}

interface HabitState {
    habits: Habit[];
    checkIns: CheckInsMap;

    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    reorderHabits: (newOrder: Habit[]) => void;

    toggleCheckIn: (habitId: string, date: string) => void;
    setCheckInValue: (habitId: string, date: string, value: number) => void; // New action
    updateNote: (habitId: string, date: string, note: string) => void;

    importData: (habits: Habit[], checkIns: CheckInsMap) => void;
    resetData: () => void;
}

export const useHabitStore = create<HabitState>()(
    persist(
        (set) => ({
            habits: [],
            checkIns: {},

            addHabit: (habitData) => set((state) => ({
                habits: [
                    ...state.habits,
                    {
                        ...habitData,
                        id: generateId(),
                        createdAt: new Date().toISOString(),
                        archived: false,
                        // Default theme if not provided, derived from color or fallback
                        theme: habitData.theme || 'blue',
                    },
                ],
            })),

            updateHabit: (id, updates) => set((state) => ({
                habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
            })),

            deleteHabit: (id) => set((state) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: _, ...remainingCheckIns } = state.checkIns;
                return {
                    habits: state.habits.filter((h) => h.id !== id),
                    checkIns: remainingCheckIns
                };
            }),

            reorderHabits: (newOrder) => set(() => ({
                habits: newOrder,
            })),

            toggleCheckIn: (habitId, date) => set((state) => {
                const habitCheckIns = state.checkIns[habitId] || {};
                const currentCheckIn = habitCheckIns[date];

                const isCompleted = currentCheckIn?.completed ?? false;
                const newValue = isCompleted ? 0 : 1;

                const newCheckIn: CheckIn = {
                    completed: !isCompleted,
                    value: newValue,
                    note: currentCheckIn?.note,
                    timestamp: Date.now(),
                };

                let newHabitCheckIns = { ...habitCheckIns };

                if (!newCheckIn.completed && !newCheckIn.note) {
                    delete newHabitCheckIns[date];
                } else {
                    newHabitCheckIns[date] = newCheckIn;
                }

                return {
                    checkIns: {
                        ...state.checkIns,
                        [habitId]: newHabitCheckIns,
                    },
                };
            }),

            setCheckInValue: (habitId, date, value) => set((state) => {
                const habitCheckIns = state.checkIns[habitId] || {};
                const currentCheckIn = habitCheckIns[date];

                // If value > 0, it is completed.
                const completed = value > 0;

                const newCheckIn: CheckIn = {
                    completed,
                    value,
                    note: currentCheckIn?.note,
                    timestamp: Date.now(),
                };

                let newHabitCheckIns = { ...habitCheckIns };

                if (!completed && !newCheckIn.note) {
                    delete newHabitCheckIns[date];
                } else {
                    newHabitCheckIns[date] = newCheckIn;
                }

                return {
                    checkIns: {
                        ...state.checkIns,
                        [habitId]: newHabitCheckIns,
                    }
                };
            }),

            updateNote: (habitId, date, note) => set((state) => {
                const habitCheckIns = state.checkIns[habitId] || {};
                const currentCheckIn = habitCheckIns[date] || { completed: false, value: 0, timestamp: Date.now() };

                const newCheckIn: CheckIn = {
                    ...currentCheckIn,
                    note,
                    timestamp: Date.now(),
                };

                // If note is empty and not completed, remove entry
                let newHabitCheckIns = { ...habitCheckIns };
                if (!newCheckIn.completed && !note) {
                    delete newHabitCheckIns[date];
                } else {
                    newHabitCheckIns[date] = newCheckIn;
                }

                return {
                    checkIns: {
                        ...state.checkIns,
                        [habitId]: newHabitCheckIns,
                    }
                };
            }),

            importData: (habits, checkIns) => set(() => ({
                habits,
                checkIns,
            })),

            resetData: () => set(() => ({
                habits: [],
                checkIns: {}
            }))
        }),
        {
            name: 'habit-tracker-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
