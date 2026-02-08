"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, Trash2, Edit2, Archive } from "lucide-react";
import { useHabitStore } from "@/store/useHabitStore";
import { HabitHeatmap } from "@/components/HabitHeatmap";
import { HabitForm } from "@/components/HabitForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function HabitDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { habits, checkIns, deleteHabit } = useHabitStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const habit = habits.find((h) => h.id === id);

    if (!habit) {
        return (
            <div className="container py-8 text-center">
                <h2 className="text-xl font-bold">Habit not found</h2>
                <Button className="mt-4" onClick={() => router.push("/")}>
                    Return Home
                </Button>
            </div>
        );
    }

    const habitCheckIns = checkIns[id] || {};
    const completedDates = Object.values(habitCheckIns).filter(c => c.completed);
    const totalCompletions = completedDates.length;

    // Calculate stats
    const today = new Date();
    const createdDate = new Date(habit.createdAt);
    const daysSinceCreation = differenceInDays(today, createdDate) + 1;
    const completionRate = daysSinceCreation > 0
        ? Math.round((totalCompletions / daysSinceCreation) * 100)
        : 0;

    // Longest streak logic (simplified)
    // iterate all dates and find max consecutive
    let longestStreak = 0;
    let tempStreak = 0;
    // Get all dates sorted
    const sortedDates = Object.keys(habitCheckIns)
        .filter(d => habitCheckIns[d].completed)
        .sort();

    if (sortedDates.length > 0) {
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            if (differenceInDays(curr, prev) === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        }
    } else {
        longestStreak = 0;
    }


    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this habit? This cannot be undone.")) {
            deleteHabit(id);
            router.push("/");
        }
    };

    return (
        <main className="container min-h-screen py-8 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <div
                        className="h-12 w-12 rounded-lg border-2 flex items-center justify-center"
                        style={{ borderColor: habit.color, backgroundColor: `${habit.color}20` }}
                    >
                        {/* Preview Pattern */}
                        <div className="relative w-full h-full habit-icon-preview">
                            {/* We can construct a mini svg or just use color */}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{habit.name}</h1>
                        <p className="text-muted-foreground capitalize">{habit.frequency} Goal</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{totalCompletions}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="text-2xl font-bold">{completionRate}%</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                    <p className="text-2xl font-bold">{longestStreak}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Stored Since</p>
                    <p className="text-lg font-medium">{format(createdDate, "MMM d, yyyy")}</p>
                </Card>
            </div>

            <Card className="p-6 mb-8 overflow-hidden">
                <h3 className="text-lg font-semibold mb-4">History</h3>
                <HabitHeatmap habit={habit} />
            </Card>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Habit"
            >
                <HabitForm initialData={habit} onClose={() => setIsEditModalOpen(false)} />
            </Modal>
        </main>
    );
}
