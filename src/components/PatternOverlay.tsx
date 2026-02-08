import React from "react";
import { cn } from "@/lib/utils";

export type PatternType =
    | "diagonal-right"
    | "diagonal-left"
    | "crosshatch"
    | "dots"
    | "dashed-h"
    | "dashed-v"
    | "circles"
    | "waves"
    | "none";

interface PatternOverlayProps {
    pattern: PatternType;
    color?: string; // CSS variable or hex
    className?: string;
    opacity?: number;
}

export const PatternOverlay: React.FC<PatternOverlayProps> = ({
    pattern,
    color = "currentColor",
    className,
    opacity = 0.5,
}) => {
    if (pattern === "none") return null;

    // We use a unique ID for the pattern to avoid conflicts if multiple SVG instances exist
    // Using a random string or hash would be safer, but for now we rely on the consumer to not render duplicates heavily or we can generate a unique ID here if we had a stable ID generator.
    // For simplicity in this offline app, we'll map pattern name to a fixed ID and assume one definition per page or use the pattern directly if possible.
    // Actually, to use patterns as fills, they need to be defined in a <defs> block.
    // To avoid ID collisions, we can include the color in the ID if we dynamic it, or just use a mask.
    // Better yet, we can render the path directly inside the SVG if we want to avoid <defs> reference issues across shadow DOMs or standard DOMs, but patterns repeat.
    // Reusable patterns in <defs> is efficient. Let's create a global Definition component or just inline the pattern for simplicity if performance permits.
    // Let's go with inline patterns for maximum flexibility with colors without complex ID management. 
    // Wait, inline patterns need <pattern> tag.

    const patternId = `pattern-${pattern}-${color.replace(/[^a-z0-9]/gi, '')}`;

    return (
        <div
            className={cn("absolute inset-0 pointer-events-none", className)}
            style={{ opacity }}
        >
            <svg width="100%" height="100%">
                <defs>
                    <pattern
                        id={patternId}
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                    >
                        {getPatternPath(pattern, color)}
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
        </div>
    );
};

function getPatternPath(pattern: PatternType, color: string) {
    const stroke = color;
    const fill = color;

    switch (pattern) {
        case "diagonal-right": // ↘
            return (
                <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke={stroke} strokeWidth="2" />
            );
        case "diagonal-left": // ↗
            return (
                <path d="M-1,9 l2,2 M0,0 l10,10 M9,-1 l2,2" stroke={stroke} strokeWidth="2" />
            );
        case "crosshatch":
            return (
                <path d="M0,0 l10,10 M10,0 l-10,10" stroke={stroke} strokeWidth="1" />
            );
        case "dots":
            return <circle cx="5" cy="5" r="1.5" fill={fill} />;
        case "dashed-h":
            return <path d="M0,5 h10" stroke={stroke} strokeWidth="2" strokeDasharray="3,3" />;
        case "dashed-v":
            return <path d="M5,0 v10" stroke={stroke} strokeWidth="2" strokeDasharray="3,3" />;
        case "circles":
            return <circle cx="5" cy="5" r="3" stroke={stroke} strokeWidth="1" fill="none" />;
        case "waves":
            return <path d="M0,5 c2.5,-3 7.5,-3 10,0" stroke={stroke} strokeWidth="2" fill="none" transform="scale(1, 1)" />;
        default:
            return null;
    }
}
