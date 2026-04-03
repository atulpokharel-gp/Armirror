"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FamilyProfile } from "@/types/profile";

async function fetchProfiles(): Promise<FamilyProfile[]> {
  const res = await fetch("/api/profiles");
  if (!res.ok) throw new Error("Failed to fetch profiles");
  return res.json();
}

async function createProfile(data: Partial<FamilyProfile>): Promise<FamilyProfile> {
  const res = await fetch("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create profile");
  return res.json();
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${id}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json() as Promise<FamilyProfile>;
    },
    enabled: !!id,
  });
}
