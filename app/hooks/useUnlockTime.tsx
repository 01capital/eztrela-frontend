import { useState, useEffect } from "react";

export function useUnlockTime() {
  // Define unlock time: 5 PM EST tomorrow
  const now = new Date();
  const lauchDate = Date.parse("2025-03-14T21:00:00Z");

  const unlockTime = lauchDate;

  const [timeLeft, setTimeLeft] = useState(unlockTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(unlockTime - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockTime]);

  return {
    unlockTime,
    timeLeft,
    isUnlocked: timeLeft <= 0,
  };
}
