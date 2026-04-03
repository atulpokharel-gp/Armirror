import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FamilyProfile } from "@/types/profile";

interface ProfileStore {
  profiles: FamilyProfile[];
  activeProfileId: string | null;
  setProfiles: (profiles: FamilyProfile[]) => void;
  addProfile: (profile: FamilyProfile) => void;
  updateProfile: (id: string, updates: Partial<FamilyProfile>) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  getActiveProfile: () => FamilyProfile | undefined;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      setProfiles: (profiles) => set({ profiles }),
      addProfile: (profile) => set((s) => ({ profiles: [...s.profiles, profile] })),
      updateProfile: (id, updates) =>
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removeProfile: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
        })),
      setActiveProfile: (id) => set({ activeProfileId: id }),
      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find((p) => p.id === activeProfileId);
      },
    }),
    { name: "stylemirror-profiles" }
  )
);
