import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useHabitStore, Habit } from "@/store/useHabitStore";
import { format, getDay, addDays, subDays } from "date-fns";
import { DayDetailModal } from "./DayDetailModal";
import { HABIT_THEMES, DEFAULT_THEME, getTheme } from "@/lib/habit-themes";
import { cn } from "@/lib/utils";
import { Edit2 } from "lucide-react";

interface HabitHeatmapProps {
    habit: Habit;
}

interface WeekData {
    id: number;
    monday: Date; // The Monday of this week
    days: Date[]; // Array of 7 days (Mon-Sun)
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ habit }) => {
    const { checkIns, setCheckInValue } = useHabitStore();
    const [weeks, setWeeks] = useState<WeekData[]>([]);
    const [isLoadingBottom, setIsLoadingBottom] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Modal state
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Year Indicator state
    const [visibleYear, setVisibleYear] = useState(new Date().getFullYear());
    const [showYearIndicator, setShowYearIndicator] = useState(false);
    const yearIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Theme Config
    const theme = getTheme(habit.theme);
    const habitCheckIns = checkIns[habit.id] || {};

    // Helper: Get Monday of a date
    const getMonday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    // Helper: Format row header (e.g. "Sep 21")
    const formatRowHeader = (date: Date) => {
        return format(date, "MMM d");
    };

    // Helper: Generate week days
    const generateWeek = (mondayDate: Date) => {
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push(addDays(mondayDate, i));
        }
        return week;
    };

    // Init Logic: Load current week + 10 past weeks
    useEffect(() => {
        const today = new Date();
        const currentMonday = getMonday(today);
        const initialWeeks: WeekData[] = [];

        // Start from current week (i=0) and go back 10 weeks
        // User asked for: "Current Week at Top" implementation.
        // So we push current week first, then past weeks.
        for (let i = 0; i >= -10; i--) {
            const monday = addDays(currentMonday, i * 7);
            initialWeeks.push({
                id: monday.getTime(),
                monday: monday,
                days: generateWeek(monday)
            });
        }
        setWeeks(initialWeeks);
    }, []);

    // Load past weeks (Infinite Scroll)
    const loadPastWeeks = useCallback(() => {
        if (isLoadingBottom || weeks.length === 0) return;

        setIsLoadingBottom(true);
        setTimeout(() => {
            const lastMonday = weeks[weeks.length - 1].monday;
            const newWeeks: WeekData[] = [];

            for (let i = 1; i <= 4; i++) {
                const monday = subDays(lastMonday, i * 7);
                newWeeks.push({
                    id: monday.getTime(),
                    monday: monday,
                    days: generateWeek(monday)
                });
            }

            setWeeks(prev => [...prev, ...newWeeks]);
            setIsLoadingBottom(false);
        }, 300); // Simulate network/calc delay and for smooth UX
    }, [weeks, isLoadingBottom]);

    // Scroll Handler
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        // Show Year Indicator
        setShowYearIndicator(true);
        if (yearIndicatorTimeoutRef.current) clearTimeout(yearIndicatorTimeoutRef.current);
        yearIndicatorTimeoutRef.current = setTimeout(() => setShowYearIndicator(false), 1500);

        // Update Visible Year
        // Find week element closest to center
        const middleY = container.getBoundingClientRect().top + clientHeight / 2;
        const weekElements = container.querySelectorAll('[data-week-monday]');

        let closestDist = Infinity;
        let closestYear = visibleYear;

        weekElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elemMiddle = rect.top + rect.height / 2;
            const dist = Math.abs(elemMiddle - middleY);
            if (dist < closestDist) {
                closestDist = dist;
                const ts = parseInt(el.getAttribute('data-week-monday') || '0');
                if (ts) closestYear = new Date(ts).getFullYear();
            }
        });
        setVisibleYear(closestYear);

        // Check Infinite Scroll threshold (200px from bottom)
        if (scrollHeight - scrollTop - clientHeight < 200 && !isLoadingBottom) {
            loadPastWeeks();
        }
    }, [isLoadingBottom, loadPastWeeks, visibleYear]);

    const scrollToToday = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Scroll to top because current week is always at top [index 0]
        container.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Interaction Handlers
    const handleDayLeftClick = (date: Date, e: React.MouseEvent) => {
        e.preventDefault();
        const dateKey = format(date, "yyyy-MM-dd");
        // Prevent future dates logic? User said "Calendar stops at current week, preventing future entries"
        // But if current week has future days (e.g. today is Wed, Thu/Fri are future), usually we disable them.
        if (date > new Date()) return;

        const currentData = habitCheckIns[dateKey];
        // If has value, increment. If boolean true, treat as 1 -> 2. If empty/false -> 1.
        const currentVal = currentData?.value !== undefined
            ? currentData.value
            : (currentData?.completed ? 1 : 0);

        const newVal = currentVal + 1;
        setCheckInValue(habit.id, dateKey, newVal);
    };

    const handleDayRightClick = (date: Date, e: React.MouseEvent) => {
        e.preventDefault();
        // Allow editing today or past
        if (date > new Date()) return;

        setSelectedDate(date);
    };

    // Styling Helpers
    const getIntensityClass = (val: number) => {
        if (val === 0) return theme.intensity[0];
        if (val <= 5) return theme.intensity[1];
        if (val <= 10) return theme.intensity[2];
        if (val <= 20) return theme.intensity[3];
        return theme.intensity[4];
    };

    const weekDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const todayStr = format(new Date(), "yyyy-MM-dd");

    // Stats for Legend
    // actually legend is static

    return (
        <div className={cn("flex flex-col h-[600px] overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-colors", theme.baseBg)}>

            {/* Header Columns */}
            <div className={`flex border-b border-gray-200 bg-white/50 backdrop-blur-sm z-10 sticky top-0`}>
                <div className="w-16 flex-shrink-0 px-2 py-3 text-xs font-semibold text-gray-500 text-center">
                    Week
                </div>
                {weekDays.map(d => (
                    <div key={d} className="flex-1 text-center py-3 text-xs font-semibold text-gray-700">
                        {d}
                    </div>
                ))}
            </div>

            {/* Scrollable Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto relative"
            >
                {/* Year Overlay */}
                {showYearIndicator && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none sticky">
                        <div className="bg-gray-900/90 text-white px-6 py-2 rounded-full shadow-xl backdrop-blur-md">
                            <span className="text-xl font-bold">{visibleYear}</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col">
                    {weeks.map(week => (
                        <div
                            key={week.id}
                            className="flex border-b border-gray-100/50 hover:bg-white/30 transition-colors py-1"
                            data-week-monday={week.id}
                        >
                            {/* Row Header */}
                            <div className="w-16 flex-shrink-0 flex items-center justify-center text-[10px] font-medium text-gray-400">
                                {formatRowHeader(week.monday)}
                            </div>

                            {/* Days */}
                            {week.days.map(date => {
                                const dateKey = format(date, "yyyy-MM-dd");
                                const isToday = dateKey === todayStr;
                                const isFuture = date > new Date();
                                const data = habitCheckIns[dateKey];
                                const hasData = data?.completed || (data?.value && data.value > 0);
                                const val = data?.value !== undefined ? data.value : (data?.completed ? 1 : 0);
                                const hasNote = !!data?.note;

                                return (
                                    <div key={dateKey} className="flex-1 px-1 py-1">
                                        <button
                                            onClick={(e) => handleDayLeftClick(date, e)}
                                            onContextMenu={(e) => handleDayRightClick(date, e)}
                                            disabled={isFuture}
                                            title={`${format(date, "PPP")} - ${val} reps`}
                                            className={cn(
                                                "w-full h-12 rounded-lg text-xs font-medium transition-all duration-200 relative flex flex-col items-center justify-center",
                                                !isFuture ? getIntensityClass(val) : "opacity-20 cursor-default bg-gray-100",
                                                isToday && "ring-2 ring-offset-2 ring-primary",
                                                !isFuture && "hover:scale-105 hover:shadow-sm active:scale-95"
                                            )}
                                        >
                                            <span className="opacity-70 text-[10px]">{date.getDate()}</span>
                                            {hasData && val > 0 && (
                                                <span className="font-bold">{val}</span>
                                            )}

                                            {hasNote && (
                                                <div className="absolute top-1 right-1">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", val > 0 ? "bg-white/70" : "bg-gray-400")} />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {isLoadingBottom && (
                        <div className="text-center py-4 text-xs text-gray-500 animate-pulse">
                            Loading history...
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Controls */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
                {/* Legend */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium mr-1">Intensity:</span>
                    {/* 0 */}
                    <div className="flex items-center gap-1">
                        <div className={cn("w-3 h-3 rounded box-border border border-gray-200 bg-gray-50")}></div>
                        <span>0</span>
                    </div>
                    {/* Ranges */}
                    {[
                        { label: '1-5', cls: theme.intensity[1] },
                        { label: '6-10', cls: theme.intensity[2] },
                        { label: '11-20', cls: theme.intensity[3] },
                        { label: '20+', cls: theme.intensity[4] },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                            <div className={cn("w-3 h-3 rounded", item.cls)}></div>
                            <span className="hidden sm:inline">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Today Scroll Button */}
                <button
                    onClick={scrollToToday}
                    className={cn(
                        "px-4 py-2 rounded-full text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1 sm:gap-2",
                        // Use theme gradient for button
                        `bg-gradient-to-r ${theme.gradient.replace('from-', 'from-').replace('to-', 'to-')} bg-[length:200%_200%] animate-gradient`
                    )}
                    // Fallback style if gradient doesn't behave well as bg-image
                    style={{ backgroundColor: theme.primaryColor }}
                >
                    Today
                </button>
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
