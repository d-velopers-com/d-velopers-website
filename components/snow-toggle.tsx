"use client";

import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { useSnowfall } from "@/contexts/snowfall-context";

/**
 * Snow toggle button - controls the snowfall effect
 * Only visible during December
 */
export function SnowToggle() {
    const { isSnowEnabled, toggleSnow, isDecember } = useSnowfall();

    // Only show during December
    if (!isDecember) return null;

    return (
        <Tooltip content={isSnowEnabled ? "Desactivar nieve" : "Activar nieve"}>
            <Button
                isIconOnly
                aria-label={isSnowEnabled ? "Disable snow" : "Enable snow"}
                variant="light"
                size="sm"
                onPress={toggleSnow}
                className="text-lg"
            >
                {isSnowEnabled ? "❄️" : "☀️"}
            </Button>
        </Tooltip>
    );
}
