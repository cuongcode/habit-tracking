"use client";

import React from "react";
import { Dialog, DialogPanel, DialogBackdrop, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-in-out data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <DialogPanel
                        transition
                        className={cn(
                            "relative transform overflow-hidden rounded-lg bg-background p-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-border",
                            "duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                        )}
                    >
                        <div className="flex items-center justify-between mb-4">
                            {title && <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>}
                            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                        <div>{children}</div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};
