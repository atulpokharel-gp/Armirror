"use client";
import { useState, useCallback } from "react";
import { BodyModelEstimation } from "@/types/body-model";
import { estimateBodyMeasurements } from "@/lib/ai/body-model";

export function useBodyModel(profileId: string) {
  const [estimation, setEstimation] = useState<BodyModelEstimation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const estimateFromPhoto = useCallback(
    async (imageUrl: string, height?: number, weight?: number) => {
      setIsLoading(true);
      setError(null);
      setProgress(0);

      try {
        const interval = setInterval(() => {
          setProgress((p) => Math.min(p + 15, 85));
        }, 300);

        const result = await estimateBodyMeasurements(imageUrl, height, weight);

        clearInterval(interval);
        setProgress(100);
        setEstimation(result);

        // Persist to API
        await fetch("/api/body-model", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, ...result }),
        });

        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Estimation failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [profileId]
  );

  const reset = useCallback(() => {
    setEstimation(null);
    setError(null);
    setProgress(0);
  }, []);

  return { estimation, isLoading, error, progress, estimateFromPhoto, reset };
}
