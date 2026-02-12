import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useHabitStore } from "@/store/useHabitStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2 } from "lucide-react";

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
    const { checkIns, setCheckInValue, updateNote, toggleCheckIn } = useHabitStore();
    const dateString = format(date, "yyyy-MM-dd");
    const checkIn = checkIns[habitId]?.[dateString];

    // State for local editing before save
    const [reps, setReps] = useState<string>("");
    const [note, setNote] = useState("");

    // Sync state when modal opens
    useEffect(() => {
        if (isOpen) {
            const currentReps = checkIn?.value !== undefined ? checkIn.value : (checkIn?.completed ? 1 : 0);
            setReps(currentReps.toString());
            setNote(checkIn?.note || "");
        }
    }, [isOpen, dateString, checkIn]);

    const handleSave = () => {
        const val = parseInt(reps) || 0;
        // Update value
        setCheckInValue(habitId, dateString, val);
        // Update note
        updateNote(habitId, dateString, note);
        onClose();
    };

    const handleDelete = () => {
        // Deleting means setting to 0 reps and empty note? 
        // Or actually removing the entry. 
        // Existing store doesn't have explicit "delete" but setCheckInValue(0) + updateNote("") will remove it if implemented that way.
        // Let's use setCheckInValue(0) and updateNote("") or maybe just toggle checkin if it was boolean?
        // Let's manualy clear it.
        setCheckInValue(habitId, dateString, 0);
        updateNote(habitId, dateString, "");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={format(date, "EEEE, MMMM d, yyyy")}
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Reps
                    </label>
                    <Input
                        type="number"
                        min="0"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        placeholder="Enter reps..."
                        className="text-lg"
                        autoFocus
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Notes
                        </label>
                        <span className="text-xs text-muted-foreground">
                            {note.length}/250
                        </span>
                    </div>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        placeholder="Add notes about this day..."
                        value={note}
                        onChange={(e) => {
                            if (e.target.value.length <= 250) {
                                setNote(e.target.value);
                            }
                        }}
                        rows={4}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={handleSave}
                        className="flex-1"
                    >
                        Save
                    </Button>

                    {/* Show delete only if there is data */}
                    {(checkIn?.completed || checkIn?.note) && (
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            className="px-3"
                            title="Delete Entry"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}

                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
