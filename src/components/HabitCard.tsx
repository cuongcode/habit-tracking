import React from "react";
import Link from "next/link";
import { format, subDays, isSameDay } from "date-fns";
import { Check, Flame } from "lucide-react";
import { useHabitStore, Habit } from "@/store/useHabitStore";
import { PatternOverlay } from "./PatternOverlay";
import { Card } from "./ui/Card";
import { cn } from "@/lib/utils";

interface HabitCardProps {
    habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
    const { checkIns, toggleCheckIn } = useHabitStore();

    // Get last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i);
        return {
            date: d,
            dateString: format(d, "yyyy-MM-dd"), // Correct format YYYY-MM-DD
            dayLabel: format(d, "EEE"), // Mon, Tue...
        };
    });

    const habitCheckIns = checkIns[habit.id] || {};

    // Calculate Streak (Simplified for now: count consecutive days backwards from today/yesterday)
    // TODO: Move streak logic to a utility or store selector for performance
    let currentStreak = 0;
    let checkDate = today;
    // If today is not checked, start checking from yesterday
    if (!habitCheckIns[format(today, "yyyy-MM-dd")]?.completed) {
        checkDate = subDays(today, 1);
    }

    while (true) {
        const ds = format(checkDate, "yyyy-MM-dd");
        if (habitCheckIns[ds]?.completed) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <Link href={`/habit/${habit.id}`} className="group">
                        <h3 className="text-lg font-semibold group-hover:underline">{habit.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Flame className={cn("mr-1 h-4 w-4", currentStreak > 0 ? "text-orange-500" : "text-gray-400")} />
                            <span>{currentStreak} day streak</span>
                        </div>
                    </Link>
                </div>

                <div className="flex justify-between items-center gap-1">
                    {last7Days.map(({ date, dateString, dayLabel }) => {
                        const isCompleted = habitCheckIns[dateString]?.completed;
                        const isToday = isSameDay(date, today);

                        return (
                            <div key={dateString} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">{dayLabel.charAt(0)}</span>
                                <button
                                    onClick={() => toggleCheckIn(habit.id, dateString)}
                                    className={cn(
                                        "relative h-8 w-8 rounded-full border flex items-center justify-center overflow-hidden transition-all",
                                        isCompleted
                                            ? "border-primary"
                                            : "border-input hover:border-primary/50",
                                        isToday && !isCompleted && "ring-2 ring-primary/20"
                                    )}
                                    style={{ borderColor: isCompleted ? habit.color : undefined }}
                                >
                                    {isCompleted && (
                                        <>
                                            <PatternOverlay
                                                pattern={habit.pattern}
                                                color={habit.color === "#ffffff" ? "#000000" : habit.color}
                                                opacity={0.8}
                                            />
                                            {/* Optional checkmark if pattern is subtle, but pattern should be enough */}
                                            {habit.pattern === 'none' && (
                                                <div className="w-full h-full" style={{ backgroundColor: habit.color }} />
                                            )}
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};
