import React, { useState, useMemo } from "react";
import { format, eachDayOfInterval, subDays, isSameDay, startOfWeek, endOfWeek, getDay, isSameMonth, addDays, differenceInCalendarDays, subWeeks } from "date-fns";
import { useHabitStore, Habit } from "@/store/useHabitStore";
import { PatternOverlay } from "./PatternOverlay";
import { DayDetailModal } from "./DayDetailModal";
import { cn } from "@/lib/utils";

interface HabitHeatmapProps {
    habit: Habit;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ habit }) => {
    const { checkIns, toggleCheckIn } = useHabitStore();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Configuration
    const today = new Date();
    const weeksToShow = 20; // Number of weeks to show

    // Calculate start date: ensure it starts on a Sunday (or start of week)
    // We want to show exactly `weeksToShow` columns.
    // The last column should contain 'today'.
    // So we invoke startOfWeek on today, then subtract (weeksToShow - 1) weeks.

    const rangeEnd = endOfWeek(today);
    const rangeStart = subWeeks(startOfWeek(today), weeksToShow - 1);

    const days = useMemo(() => {
        return eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    }, [rangeStart, rangeEnd]);

    const habitCheckIns = checkIns[habit.id] || {};

    // Group days into weeks for easier column rendering logic if needed, 
    // but CSS Grid flow-col with rows=7 handles this naturally.
    // We just need to make sure `days` length is a multiple of 7.
    // date-fns `eachDayOfInterval` with start/end of weeks guarantees this.

    // Generate Month Labels
    // We need to determine which weeks start a new month.
    const weeks = useMemo(() => {
        const weekList = [];
        let currentWeekStart = rangeStart;
        while (currentWeekStart <= rangeEnd) {
            weekList.push(currentWeekStart);
            currentWeekStart = addDays(currentWeekStart, 7);
        }
        return weekList;
    }, [rangeStart, rangeEnd]);

    const monthLabels = useMemo(() => {
        const labels: { label: string, colIndex: number }[] = [];
        let lastMonthStr = "";

        weeks.forEach((weekStart, index) => {
            const monthStr = format(weekStart, "MMM");
            // Show label if it's the first week of the heatmap OR if month changes
            // But usually GitHub shows it when the majority of the week is in the new month?
            // Simple rule: If the week contains the 1st of the month, show label?
            // Let's just use the month of the start of the week.
            // If it changes from previous week, show it.
            if (monthStr !== lastMonthStr) {
                labels.push({ label: monthStr, colIndex: index });
                lastMonthStr = monthStr;
            }
        });
        return labels;
    }, [weeks]);


    const handleDayClick = (day: Date) => {
        const dateString = format(day, "yyyy-MM-dd");
        const isCompleted = habitCheckIns[dateString]?.completed;
        const isFuture = day > today;

        if (isFuture) return;

        if (!isCompleted) {
            toggleCheckIn(habit.id, dateString);
        } else {
            setSelectedDate(day); // Open modal for details/unchecking
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-fit inline-block">
                {/* Month Labels */}
                <div className="flex text-xs text-muted-foreground mb-1 h-5 relative">
                    {/* Spacer for weekday labels column */}
                    <div className="w-8 shrink-0" />

                    {/* Render labels absolutely positioned relative to the grid columns would be hard 
                        without a fixed pixel width. 
                        Instead, let's use a similar grid structure or flex with spacers?
                        
                        Actually, CSS Grid is best here.
                        We have `weeksToShow` columns.
                    */}
                    <div
                        className="grid gap-1 flex-1"
                        style={{
                            gridTemplateColumns: `repeat(${weeksToShow}, minmax(0, 1fr))`
                        }}
                    >
                        {monthLabels.map((item) => (
                            <div
                                key={`${item.label}-${item.colIndex}`}
                                className="col-span-2 overflow-visible whitespace-nowrap"
                                style={{ gridColumnStart: item.colIndex + 1 }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-1">
                    {/* Weekday Labels (Mon, Wed, Fri) */}
                    <div className="flex flex-col justify-between text-[10px] text-muted-foreground py-[2px] w-8 pr-1 font-medium items-end leading-none">
                        {/* 
                            Grid has 7 rows.
                            Row 1: Sun
                            Row 2: Mon
                            Row 3: Tue
                            Row 4: Wed
                            Row 5: Thu
                            Row 6: Fri
                            Row 7: Sat
                         */}
                        <div className="h-3 relative -top-[1px]"></div> {/* Sun placeholder */}
                        <div className="h-3 relative -top-[1px]">Mon</div>
                        <div className="h-3 relative -top-[1px]"></div> {/* Tue */}
                        <div className="h-3 relative -top-[1px]">Wed</div>
                        <div className="h-3 relative -top-[1px]"></div> {/* Thu */}
                        <div className="h-3 relative -top-[1px]">Fri</div>
                        <div className="h-3 relative -top-[1px]"></div> {/* Sat */}
                    </div>

                    {/* Heatmap Grid */}
                    <div
                        className="grid grid-flow-col grid-rows-7 gap-1"
                        style={{
                            // Ensure strict grid layout
                        }}
                    >
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
                                    onClick={() => handleDayClick(day)}
                                    title={`${format(day, "PPP")}${hasNote ? " (Has note)" : ""}`}
                                    className={cn(
                                        "relative h-3 w-3 rounded-[2px] flex items-center justify-center overflow-hidden transition-all group outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                        isCompleted
                                            ? "border border-transparent" // Colored by style below
                                            : "border border-border/40 bg-muted/20 hover:border-primary/50",
                                        isToday && !isCompleted && "ring-1 ring-primary/40",
                                        isFuture && "opacity-0 cursor-default" // Hide future days completely or make them invisible? GitHub just stops.
                                        // But we are filling the grid. CSS Grid columns must be full.
                                        // So we just make them invisible placeholders if they are after today?
                                        // Actually `eachDayOfInterval` goes up to endOfWeek(today).
                                        // So future days in the current week WILL exist.
                                        // Let's style them as disabled.
                                    )}
                                    style={{
                                        backgroundColor: isCompleted ? habit.color : undefined
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
                                            {/* Scale down note indicator for smaller cells */}
                                            <div className={cn("h-1 w-1 rounded-full", isCompleted ? "bg-white ring-1 ring-black/20" : "bg-primary")} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
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
