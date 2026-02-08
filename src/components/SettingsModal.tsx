"use client";

import React, { useRef, useState } from "react";
import { Download, Upload, Settings as SettingsIcon } from "lucide-react";
import { useHabitStore } from "@/store/useHabitStore";
import { downloadData, parseImportData } from "@/utils/storage";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
    isOpen,
    onClose,
}) => {
    const { habits, checkIns, importData } = useHabitStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const handleExport = () => {
        downloadData(habits, checkIns);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await parseImportData(file);
            if (confirm(`Import ${data.habits.length} habits? This will replace current data.`)) {
                importData(data.habits, data.checkIns);
                onClose();
                alert("Data imported successfully!");
            }
        } catch (err) {
            console.error(err);
            setImportError("Failed to import file. Invalid format.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Data Management">
            <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                    Manage your habit data. Your data is stored locally on this device.
                    Export it to back it up or move to another device.
                </p>

                <div className="flex flex-col gap-4">
                    <Button variant="outline" onClick={handleExport} className="justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export Data (.habittrack)
                    </Button>

                    <Button variant="outline" onClick={handleImportClick} className="justify-start">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Data
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".habittrack,.json"
                        className="hidden"
                    />
                    {importError && (
                        <p className="text-sm text-red-500">{importError}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
