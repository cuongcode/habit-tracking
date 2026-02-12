"use client";

import React, { useState } from "react";
import { useHabitStore, Habit, FrequencyType } from "@/store/useHabitStore";
import { PatternType, PatternOverlay } from "./PatternOverlay";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { HABIT_THEMES, DEFAULT_THEME } from "@/lib/habit-themes";

interface HabitFormProps {
    initialData?: Habit;
    onClose: () => void;
}

// COLORS array removed in favor of HABIT_THEMES


const PATTERNS: PatternType[] = [
    "none",
    "diagonal-right",
    "diagonal-left",
    "crosshatch",
    "dots",
    "dashed-h",
    "dashed-v",
    "circles",
    "waves",
];

const FREQUENCIES: FrequencyType[] = ["daily", "weekly", "monthly"];

export const HabitForm: React.FC<HabitFormProps> = ({ initialData, onClose }) => {
    const { addHabit, updateHabit } = useHabitStore();

    const [name, setName] = useState(initialData?.name || "");
    const [frequency, setFrequency] = useState<FrequencyType>(initialData?.frequency || "daily");
    // Use theme if available, otherwise fallback to finding theme by color or default
    const [theme, setTheme] = useState(initialData?.theme || DEFAULT_THEME);
    const [pattern, setPattern] = useState<PatternType>(initialData?.pattern || "none");
    const [errors, setErrors] = useState<{ name?: string }>({});

    // Keep color derived from theme for now to satisfy type requirements if we haven't fully refactored everything
    const color = HABIT_THEMES[theme]?.primaryColor || HABIT_THEMES[DEFAULT_THEME].primaryColor;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setErrors({ name: "Name is required" });
            return;
        }

        const habitData = {
            name,
            frequency,
            color, // Still saving color for backward compat or other components usage
            theme,
            pattern,
        };

        if (initialData) {
            updateHabit(initialData.id, habitData);
        } else {
            addHabit(habitData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Habit Name"
                placeholder="e.g. Read 30 mins"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({});
                }}
                error={errors.name}
                autoFocus
            />

            <div>
                <label className="mb-2 block text-sm font-medium">Frequency</label>
                <div className="flex space-x-2">
                    {FREQUENCIES.map((freq) => (
                        <Button
                            key={freq}
                            type="button"
                            variant={frequency === freq ? "primary" : "outline"}
                            onClick={() => setFrequency(freq)}
                            className="capitalize flex-1"
                        >
                            {freq}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">Theme</label>
                <div className="grid grid-cols-6 gap-2">
                    {Object.entries(HABIT_THEMES).map(([key, t]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTheme(key)}
                            className={cn(
                                "h-10 w-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary shadow-sm transition-transform hover:scale-105",
                                theme === key && "ring-2 ring-primary ring-offset-2 scale-110"
                            )}
                            style={{ background: `linear-gradient(135deg, ${t.primaryColor}, #ffffff)` }}
                            title={t.name}
                        >
                            {theme === key && (
                                <Check className="mx-auto h-5 w-5 text-white drop-shadow-md" />
                            )}
                            <span className="sr-only">Select theme {t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">Pattern</label>
                <div className="grid grid-cols-5 gap-2">
                    {PATTERNS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPattern(p)}
                            className={cn(
                                "relative h-10 w-full rounded-md border border-gray-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                                pattern === p && "ring-2 ring-primary ring-offset-2 border-primary"
                            )}
                        >
                            <PatternOverlay pattern={p} color={color} opacity={1} />
                            {pattern === p && <div className="absolute inset-0 border-2 border-primary rounded-md" />}
                            <span className="sr-only">Select pattern {p}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? "Save Changes" : "Create Habit"}
                </Button>
            </div>
        </form>
    );
};
