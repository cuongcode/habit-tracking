import React, { useState } from "react";
import { format, eachDayOfInterval, subWeeks, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { useHabitStore, Habit } from "@/store/useHabitStore";
import { PatternOverlay } from "./PatternOverlay";
import { DayDetailModal } from "./DayDetailModal";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface HabitHeatmapProps {
    habit: Habit;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ habit }) => {
    const { checkIns, toggleCheckIn } = useHabitStore();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const today = new Date();
    // Show last 16 weeks (approx 4 months)
    const startDate = startOfWeek(subWeeks(today, 15));
    const endDate = endOfWeek(today);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const habitCheckIns = checkIns[habit.id] || {};

    const handleDayClick = (day: Date) => {
        const dateString = format(day, "yyyy-MM-dd");
        const isCompleted = habitCheckIns[dateString]?.completed;

        // If completed, open modal to see/edit note or uncheck.
        // If not completed, just toggle check (quick action).
        // User can long-press or we can have a different interaction for notes on empty days?
        // Let's stick to: Click on empty -> Toggle. Click on filled -> Modal.
        // Wait, if I want to add a note to a day I just checked, I have to click it again? Yes.
        // Or we can simple open modal for ALL clicks? That might be too slow for "tracking".
        // Hybrid: Click toggles. Right click or Long press opens modal?
        // The requirement says "Quick note modal/drawer".
        // Let's assume clicking a day ALWAYS opens the details if it has a note.
        // Actually, simplest usage:
        // Single click: Toggle.
        // Double click (or shift click): Open Modal?
        // Let's just make it so clicking opens modal IF it's checked OR pass a prop?
        // The user wants "Instant pattern overlay on check". So single click must toggle.
        // Let's add a small indicator for "has note".
        // And maybe a way to open modal.

        // Revised interaction for Detail View:
        // Click -> Toggle
        // If you want to add a note, you click the date label? No.
        // Let's follow GitHub style: Click opens a summary, but that's for read-only usually.

        // Let's try:
        // Single Click: Toggle Check-in.
        // Long Press / Right Click (context menu): Open Details.
        // Since this is web app, let's just add a "Details" button or make the day interactive.
        // Let's go with: Click toggles. If you want to add a note, use the DayDetailModal which we can trigger
        // via a separate interaction or if we just decide that for the DETAILED VIEW, clicking opens the modal?
        // No, quick check in is nice.

        // Let's implement: Click to Toggle.
        // BUT, if we want to edit notes, we need a trigger.
        // I'll add a "Manage Day" mode or just let single click toggle, and maybe `Alt+Click` or right click opens modal.
        // For mobile, maybe just tapping an already checked day opens modal?
        // Logic:
        // If Unchecked -> Click -> Checks it.
        // If Checked -> Click -> Opens Modal (which has uncheck button).
        // This allows quick checking, but requires two taps to uncheck. Safe.

        if (!isCompleted) {
            toggleCheckIn(habit.id, dateString);
        } else {
            setSelectedDate(day);
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[700px]">
                <div className="flex text-xs text-muted-foreground mb-2">
                    {/* Weekday labels */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="w-8 text-center">{day}</div>
                    ))}
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {days.map((day) => {
                        const dateString = format(day, "yyyy-MM-dd");
                        const checkIn = habitCheckIns[dateString];
                        const isCompleted = checkIn?.completed;
                        const hasNote = !!checkIn?.note;
                        const isToday = isSameDay(day, today);
                        const isFuture = day > today;

                        return (
                            <button
                                key={dateString}
                                disabled={isFuture}
                                onClick={() => !isFuture && handleDayClick(day)}
                                title={`${format(day, "PPP")}${hasNote ? " (Has note)" : ""}`}
                                className={cn(
                                    "relative h-8 w-8 rounded-sm border flex items-center justify-center overflow-hidden transition-all group",
                                    isCompleted
                                        ? "border-primary"
                                        : "border-input hover:border-primary/50",
                                    isToday && !isCompleted && "ring-2 ring-primary/20",
                                    isFuture && "opacity-20 cursor-not-allowed border-transparent bg-secondary"
                                )}
                                style={{
                                    borderColor: isCompleted ? habit.color : undefined
                                }}
                            >
                                {isCompleted && (
                                    <>
                                        <PatternOverlay
                                            pattern={habit.pattern}
                                            color={habit.color === "#ffffff" ? "#000000" : habit.color}
                                            opacity={0.8}
                                        />
                                        {habit.pattern === 'none' && (
                                            <div className="w-full h-full" style={{ backgroundColor: habit.color }} />
                                        )}
                                    </>
                                )}
                                {hasNote && (
                                    <div className="absolute top-0.5 right-0.5">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", isCompleted ? "bg-white ring-1 ring-black/20" : "bg-primary")} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <DayDetailModal
                    isOpen={!!selectedDate}
                    onClose={() => setSelectedDate(null)}
                    habitId={habit.id}
                    date={selectedDate}
                />
            )}
        </div>
    );
};
