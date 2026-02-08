"use client";

import React, { useState } from "react";
import { useHabitStore, Habit, FrequencyType } from "@/store/useHabitStore";
import { PatternType, PatternOverlay } from "./PatternOverlay";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface HabitFormProps {
    initialData?: Habit;
    onClose: () => void;
}

const COLORS = [
    "#ffffff",
    "#f2f2f2",
    "#e6e6e6",
    "#cccccc",
    "#b3b3b3",
    "#999999",
    "#808080",
    "#666666",
    "#4d4d4d",
    "#333333",
    "#1a1a1a",
    "#000000",
];

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
    const [color, setColor] = useState(initialData?.color || "#000000");
    const [pattern, setPattern] = useState<PatternType>(initialData?.pattern || "none");
    const [errors, setErrors] = useState<{ name?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setErrors({ name: "Name is required" });
            return;
        }

        if (initialData) {
            updateHabit(initialData.id, {
                name,
                frequency,
                color,
                pattern,
            });
        } else {
            addHabit({
                name,
                frequency,
                color,
                pattern,
            });
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
                <label className="mb-2 block text-sm font-medium">Color</label>
                <div className="grid grid-cols-6 gap-2">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={cn(
                                "h-8 w-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                                color === c && "ring-2 ring-primary ring-offset-2"
                            )}
                            style={{ backgroundColor: c }}
                        >
                            {color === c && (
                                <Check className={cn("mx-auto h-4 w-4", c === "#ffffff" || c === "#f2f2f2" ? "text-black" : "text-white")} />
                            )}
                            <span className="sr-only">Select color {c}</span>
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
                            <PatternOverlay pattern={p} color={color === "#ffffff" ? "#000000" : color} opacity={1} />
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
