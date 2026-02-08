import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                "bg-card text-card-foreground rounded-lg border shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
