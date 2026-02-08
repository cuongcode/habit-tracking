import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useHabitStore } from "@/store/useHabitStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DayDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    habitId: string;
    date: Date;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
    isOpen,
    onClose,
    habitId,
    date,
}) => {
    const { checkIns, toggleCheckIn, updateNote } = useHabitStore();
    const dateString = format(date, "yyyy-MM-dd");
    const checkIn = checkIns[habitId]?.[dateString];
    const isCompleted = checkIn?.completed || false;

    const [note, setNote] = useState(checkIn?.note || "");

    // Sync state when modal opens or date changes
    useEffect(() => {
        if (isOpen) {
            setNote(checkIns[habitId]?.[dateString]?.note || "");
        }
    }, [isOpen, habitId, dateString, checkIns]);

    const handleSave = () => {
        updateNote(habitId, dateString, note);
        onClose();
    };

    const handleToggle = () => {
        toggleCheckIn(habitId, dateString);
        // If we just unchecked, maybe close? Or stay open to let them re-check?
        // Let's stay open.
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Check-in: ${format(date, "PPP")}`}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <span className="font-medium">Status</span>
                    <Button
                        variant={isCompleted ? "primary" : "outline"}
                        onClick={handleToggle}
                        className={isCompleted ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                        {isCompleted ? "Completed" : "Mark as Done"}
                    </Button>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">Notes</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="How did it go?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={handleSave}>Save Note</Button>
                </div>
            </div>
        </Modal>
    );
};
