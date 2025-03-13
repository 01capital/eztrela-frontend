"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ unlockTime }: { unlockTime: number }) {
  const [timeLeft, setTimeLeft] = useState(unlockTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(unlockTime - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockTime]);

  // If the time left is zero or negative, allow access
  if (timeLeft <= 0) {
    return null; // This means the app is unlocked
  }

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold"><span className="text-brandGreen">Eztrela AI</span> Unlocks Soon...</h1>
      <p className="text-lg mt-4">
        Unlocking in:{" "}
        <span className="font-mono text-2xl">
          {hours}h {minutes}m {seconds}s
        </span>
      </p>
    </div>
  );
}
