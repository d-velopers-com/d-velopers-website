"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SnowfallContextType {
    isSnowEnabled: boolean;
    toggleSnow: () => void;
    isDecember: boolean;
}

const SnowfallContext = createContext<SnowfallContextType | undefined>(undefined);

const STORAGE_KEY = "snowfall-enabled";

export function SnowfallProvider({ children }: { children: ReactNode }) {
    const [isSnowEnabled, setIsSnowEnabled] = useState(true);
    const [isDecember, setIsDecember] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Check if December and load preference from localStorage
    useEffect(() => {
        const currentMonth = new Date().getMonth();
        setIsDecember(currentMonth === 11); // 11 = December

        // Load saved preference
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
            setIsSnowEnabled(saved === "true");
        }
        setIsInitialized(true);
    }, []);

    // Save preference to localStorage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(STORAGE_KEY, String(isSnowEnabled));
        }
    }, [isSnowEnabled, isInitialized]);

    const toggleSnow = () => {
        setIsSnowEnabled((prev) => !prev);
    };

    return (
        <SnowfallContext.Provider value={{ isSnowEnabled, toggleSnow, isDecember }}>
            {children}
        </SnowfallContext.Provider>
    );
}

export function useSnowfall() {
    const context = useContext(SnowfallContext);
    if (context === undefined) {
        throw new Error("useSnowfall must be used within a SnowfallProvider");
    }
    return context;
}
