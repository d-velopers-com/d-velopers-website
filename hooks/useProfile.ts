"use client";

import { useEffect, useState } from "react";

interface ProfileData {
  handler: string;
  isPublic: boolean;
  description: string | null;
  link: string | null;
  contactLinks: string[];
  contactEmail: string | null;
  country: string | null;
  name: string | null;
  title: string | null;
  tags: string[];
  englishLevel: string | null;
  availability: string[];
  careerStartYear: string | null;
  joinedServerAt: string | null;
  profileActivatedAt: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");

      if (res.ok) {
        const data = await res.json();

        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updatePublicStatus = async (isPublic: boolean) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (res.ok) {
        const data = await res.json();

        setProfile(data);

        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const updateProfile = async (data: {
    isPublic?: boolean;
    description?: string | null;
    link?: string | null;
    contactLinks?: string[];
    contactEmail?: string | null;
    country?: string | null;
    name?: string | null;
    title?: string | null;
    tags?: string[];
    englishLevel?: string | null;
    availability?: string[];
    careerStartYear?: string | null;
  }) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updatedData = await res.json();

        setProfile(updatedData);

        return { success: true, data: updatedData };
      }

      const error = await res.json();

      return { success: false, error: error.error || "Update failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");

      if (res.ok) {
        const data = await res.json();

        setProfile(data);
      }
    } catch {
      // Silently fail on refresh
    }
  };

  return {
    profile,
    loading,
    updatePublicStatus,
    updateProfile,
    refreshProfile,
  };
}
