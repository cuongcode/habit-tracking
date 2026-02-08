"use client";

import Image from "next/image";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useHabitStore } from "@/store/useHabitStore";
import { HabitCard } from "@/components/HabitCard";
import { HabitForm } from "@/components/HabitForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

import { SettingsModal } from "@/components/SettingsModal";
import { Settings as SettingsIcon } from "lucide-react";

export default function Home() {
  const { habits, resetData } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hydration fix for persisting store
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="container py-8 text-center">Loading...</div>; // Or skeleton
  }

  return (
    <main className="container min-h-screen py-8 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Habits</h1>
          <p className="text-muted-foreground mt-1">
            {habits.length === 0
              ? "Start building your routine today."
              : `Tracking ${habits.length} habit${habits.length === 1 ? "" : "s"}.`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="md" onClick={() => setIsSettingsOpen(true)}>
            <SettingsIcon className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} size="md">
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
      </header>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-4 rounded-full bg-secondary p-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No habits yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first habit to get started on your journey.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Create Habit</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Habit"
      >
        <HabitForm onClose={() => setIsModalOpen(false)} />
      </Modal>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Debug/Dev Utils - Remove in production or hide behind flag */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 border-t pt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => {
            if (confirm("Reset all data?")) resetData();
          }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            Reset Data
          </Button>
        </div>
      )}
    </main>
  );
}
