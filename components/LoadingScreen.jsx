// components/LoadingScreen.js
"use client";

import React, { useState, useEffect } from "react";

// Constants for timing (in milliseconds)
const COUNT_DURATION = 2000; // Time to count from 0 to 100 (slightly longer for the visual effect)
const READY_DURATION = 1000; // Time to display "Let's shop"
const FADE_DURATION = 500; // Time for the page fade-out animation

export default function LoadingScreen({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [progress, setProgress] = useState(0); // Counter state
    const [isReady, setIsReady] = useState(false); // "Let's shop" state

    useEffect(() => {
        if (isLoading && !isFadingOut) {
            // --- Phase 1: Counting from 0 to 100 ---
            const startTime = Date.now();

            const countInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                let newProgress = Math.min(
                    100,
                    Math.round((elapsed / COUNT_DURATION) * 100)
                );
                setProgress(newProgress);

                if (newProgress === 100) {
                    clearInterval(countInterval);

                    // --- Phase 2: Show "Let's shop" ---
                    setTimeout(() => {
                        setIsReady(true);
                        
                        // --- Phase 3: Initiate fade out after "Let's shop" is visible ---
                        setTimeout(() => {
                            setIsFadingOut(true);

                            // --- Phase 4: Hide component entirely after fade out ---
                            setTimeout(() => {
                                setIsLoading(false);
                            }, FADE_DURATION);
                        }, READY_DURATION);
                    }, 50); // Small delay to ensure 100% renders before ready state
                }
            }, 30); // Update counter frequently for smoother visual bar update

            return () => clearInterval(countInterval);
        }
    }, [isLoading, isFadingOut]);

    // If loading is completely finished, render the children
    if (!isLoading) {
        return children;
    }

    // --- Inline Styles ---

    const primaryGreen = "#4CAF50"; // A nice, standard green
    const lightGray = "#f0f0f0";

    const loadingContainerStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        fontWeight: "600",
        color: "#333",
        // Apply fade-out transition
        transition: `opacity ${FADE_DURATION / 1000}s ease-out`,
        opacity: isFadingOut ? 0 : 1, 
        visibility: isFadingOut ? 'hidden' : 'visible',
    };

    // Style for the main text container to keep alignment simple
    const contentContainerStyle = {
        textAlign: 'center',
        position: 'relative', // Context for absolute positioning of 'Let's shop'
        width: '80%', // Limit width for the progress bar
        maxWidth: '400px',
    };
    
    // Counter text style
    const counterTextStyle = {
        fontSize: "3rem", // Slightly reduced size
        marginBottom: "1.5rem",
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
        opacity: isReady ? 0 : 1, 
        transform: isReady ? 'translateY(-10px)' : 'translateY(0)', // Subtle movement on hide
        color: primaryGreen, // Make the count green
    };

    // Progress Bar container
    const progressBarContainerStyle = {
        height: '8px',
        width: '100%',
        backgroundColor: lightGray,
        borderRadius: '4px',
        overflow: 'hidden',
        transition: "opacity 0.3s ease-in-out",
        opacity: isReady ? 0 : 1, // Hide when "Let's shop" appears
    };

    // Progress Bar filler
    const progressBarFillerStyle = {
        height: '100%',
        width: `${progress}%`, // Controlled by state
        backgroundColor: primaryGreen,
        transition: `width ${COUNT_DURATION / 1000 / 100 * 3}s linear`, // Transition width smoothly
        borderRadius: '4px',
    };

    // "Let's shop" message style
    const readyTextStyle = {
        fontSize: "2.5rem", // Slightly larger
        color: primaryGreen,
        fontWeight: "700",
        transition: "opacity 0.5s ease-in",
        opacity: isReady ? 1 : 0, 
        // Positioned over the bar area
        position: 'absolute', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
    };

    return (
        <div style={loadingContainerStyle}>
            <div style={contentContainerStyle}>
                {/* Counter Text */}
                <div style={counterTextStyle}>
                    {progress}%
                </div>
                
                {/* Progress Bar */}
                <div style={progressBarContainerStyle}>
                    <div style={progressBarFillerStyle} />
                </div>
                
                {/* "Let's shop" Message (Absolute position for smooth transition) */}
                <div style={readyTextStyle}>
                    Let's shop
                </div>
            </div>
        </div>
    );
}