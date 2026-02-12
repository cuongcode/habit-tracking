export interface HabitTheme {
    name: string;
    primaryColor: string; // The main color for the habit (e.g., text, borders)
    gradient: string; // The background gradient class
    intensity: {
        0: string; // 0 reps
        1: string; // 1-5 reps
        2: string; // 6-10 reps
        3: string; // 11-20 reps
        4: string; // 20+ reps
    };
    baseBg: string; // Light background for indicators
    lightText: string; // Lighter text color
    darkText: string; // Darker text color
}

export const HABIT_THEMES: Record<string, HabitTheme> = {
    blue: {
        name: 'Blue',
        primaryColor: '#3b82f6', // blue-500
        gradient: 'from-blue-50 to-indigo-50',
        intensity: {
            0: 'bg-gray-100 text-gray-400',
            1: 'bg-blue-200 text-blue-800',
            2: 'bg-blue-300 text-blue-900',
            3: 'bg-blue-400 text-blue-900',
            4: 'bg-blue-500 text-white',
        },
        baseBg: 'bg-blue-50',
        lightText: 'text-blue-600',
        darkText: 'text-blue-900',
    },
    green: {
        name: 'Green',
        primaryColor: '#22c55e', // green-500
        gradient: 'from-green-50 to-emerald-50',
        intensity: {
            0: 'bg-gray-100 text-gray-400',
            1: 'bg-green-200 text-green-800',
            2: 'bg-green-300 text-green-900',
            3: 'bg-green-400 text-green-900',
            4: 'bg-green-500 text-white',
        },
        baseBg: 'bg-green-50',
        lightText: 'text-green-600',
        darkText: 'text-green-900',
    },
    purple: {
        name: 'Purple',
        primaryColor: '#a855f7', // purple-500
        gradient: 'from-purple-50 to-pink-50',
        intensity: {
            0: 'bg-gray-100 text-gray-400',
            1: 'bg-purple-200 text-purple-800',
            2: 'bg-purple-300 text-purple-900',
            3: 'bg-purple-400 text-purple-900',
            4: 'bg-purple-500 text-white',
        },
        baseBg: 'bg-purple-50',
        lightText: 'text-purple-600',
        darkText: 'text-purple-900',
    },
    orange: {
        name: 'Orange',
        primaryColor: '#f97316', // orange-500
        gradient: 'from-orange-50 to-amber-50',
        intensity: {
            0: 'bg-gray-100 text-gray-400',
            1: 'bg-orange-200 text-orange-800',
            2: 'bg-orange-300 text-orange-900',
            3: 'bg-orange-400 text-orange-900',
            4: 'bg-orange-500 text-white',
        },
        baseBg: 'bg-orange-50',
        lightText: 'text-orange-600',
        darkText: 'text-orange-900',
    },
    pink: {
        name: 'Pink',
        primaryColor: '#ec4899', // pink-500
        gradient: 'from-pink-50 to-rose-50',
        intensity: {
            0: 'bg-gray-100 text-gray-400',
            1: 'bg-pink-200 text-pink-800',
            2: 'bg-pink-300 text-pink-900',
            3: 'bg-pink-400 text-pink-900',
            4: 'bg-pink-500 text-white',
        },
        baseBg: 'bg-pink-50',
        lightText: 'text-pink-600',
        darkText: 'text-pink-900',
    },
    indigo: {
        name: 'Indigo',
        primaryColor: '#6366f1', // indigo-500
        gradient: 'from-indigo-50 to-blue-50',
        intensity: {
            0: 'bg-gray-100 text-gray-400',
            1: 'bg-indigo-200 text-indigo-800',
            2: 'bg-indigo-300 text-indigo-900',
            3: 'bg-indigo-400 text-indigo-900',
            4: 'bg-indigo-500 text-white',
        },
        baseBg: 'bg-indigo-50',
        lightText: 'text-indigo-600',
        darkText: 'text-indigo-900',
    },
};

export const DEFAULT_THEME = 'blue';

export function getTheme(themeName?: string): HabitTheme {
    return HABIT_THEMES[themeName?.toLowerCase() || DEFAULT_THEME] || HABIT_THEMES[DEFAULT_THEME];
}
