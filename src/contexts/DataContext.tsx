"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Destination, Review, mockDestinations } from "@/lib/data";

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: "user" | "admin";
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string; // Keep simple for mock purposes
}

interface DataContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  addReview: (destinationId: string, review: Review) => void;
  destinations: Destination[];
  addDestination: (dest: Destination) => void;
  updateDestination: (id: string, dest: Destination) => void;
  deleteDestination: (id: string) => void;
  
  pendingContributions: Destination[];
  addContribution: (dest: Destination) => void;
  approveContribution: (id: string, editedDest?: Partial<Destination>) => void;
  rejectContribution: (id: string) => void;

  categories: string[];
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  
  moodTags: string[];
  addMoodTag: (tag: string) => void;
  removeMoodTag: (tag: string) => void;

  logs: string[];
  addLog: (log: string) => void;

  // Admin Auth System
  admins: AdminUser[];
  loggedAdmin: AdminUser | null;
  loginAdmin: (admin: AdminUser) => void;
  logoutAdmin: () => void;
  addAdmin: (admin: AdminUser) => void;
  deleteAdmin: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<string[]>(["Alam", "Rekreasi Air", "Keluarga", "Sejarah", "Kuliner"]);
  const [moodTags, setMoodTags] = useState<string[]>(["Healing", "Santai", "Keluarga", "Romantis", "Menikmati Sunset", "Petualangan", "Kuliner"]);
  const [pendingContributions, setPendingContributions] = useState<Destination[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [admins, setAdmins] = useState<AdminUser[]>([{ id: "admin-1", username: "heru", password: "270623" }]);
  const [loggedAdmin, setLoggedAdmin] = useState<AdminUser | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedUser = localStorage.getItem("explore_pwk_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedDestinations = localStorage.getItem("explore_pwk_destinations");
    if (savedDestinations) {
      setDestinations(JSON.parse(savedDestinations));
    } else {
      setDestinations(mockDestinations);
      localStorage.setItem("explore_pwk_destinations", JSON.stringify(mockDestinations));
    }

    const savedCats = localStorage.getItem("explore_pwk_cats");
    if (savedCats) setCategories(JSON.parse(savedCats));

    const savedMoods = localStorage.getItem("explore_pwk_moods");
    if (savedMoods) setMoodTags(JSON.parse(savedMoods));

    const savedLogs = localStorage.getItem("explore_pwk_logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    const savedPending = localStorage.getItem("explore_pwk_pending");
    if (savedPending) setPendingContributions(JSON.parse(savedPending));

    const savedAdmins = localStorage.getItem("explore_pwk_admins");
    if (savedAdmins) setAdmins(JSON.parse(savedAdmins));
    
    const savedLoggedAdmin = localStorage.getItem("explore_pwk_logged_admin");
    if (savedLoggedAdmin) setLoggedAdmin(JSON.parse(savedLoggedAdmin));

    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes (if loaded)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("explore_pwk_user", JSON.stringify(user));
      localStorage.setItem("explore_pwk_destinations", JSON.stringify(destinations));
      localStorage.setItem("explore_pwk_cats", JSON.stringify(categories));
      localStorage.setItem("explore_pwk_moods", JSON.stringify(moodTags));
      localStorage.setItem("explore_pwk_logs", JSON.stringify(logs));
      localStorage.setItem("explore_pwk_pending", JSON.stringify(pendingContributions));
      localStorage.setItem("explore_pwk_admins", JSON.stringify(admins));
      localStorage.setItem("explore_pwk_logged_admin", JSON.stringify(loggedAdmin));
    }
  }, [user, destinations, categories, moodTags, logs, pendingContributions, admins, loggedAdmin, isLoaded]);

  const addDestination = (dest: Destination) => {
    setDestinations(prev => [dest, ...prev]);
    addLog(`Added new destination: ${dest.name}`);
  };

  const updateDestination = (id: string, dest: Destination) => {
    setDestinations(prev => prev.map(d => d.id === id ? dest : d));
    addLog(`Updated destination: ${dest.name}`);
  };

  const deleteDestination = (id: string) => {
    const dest = destinations.find(d => d.id === id);
    setDestinations(prev => prev.filter(d => d.id !== id));
    if (dest) addLog(`Deleted destination: ${dest.name}`);
  };

  const addCategory = (cat: string) => setCategories(prev => [...prev, cat]);
  const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat));

  const addMoodTag = (tag: string) => setMoodTags(prev => [...prev, tag]);
  const removeMoodTag = (tag: string) => setMoodTags(prev => prev.filter(t => t !== tag));

  const addReview = (destinationId: string, review: Review) => {
    setDestinations(prev => prev.map(d => {
      if (d.id === destinationId) {
        const newReviews = [...(d.reviews || []), review];
        const newTotal = (d.rating_and_reviews.total_reviews || 0) + 1;
        const newAvg = ((d.rating_and_reviews.average_rating * d.rating_and_reviews.total_reviews) + review.rating) / newTotal;
        return {
          ...d,
          reviews: newReviews,
          rating_and_reviews: {
            average_rating: Number(newAvg.toFixed(1)),
            total_reviews: newTotal
          }
        };
      }
      return d;
    }));
    addLog(`Added review for destination ${destinationId}`);
  };

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleString("id-ID");
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev]);
  };

  const addContribution = (dest: Destination) => {
    setPendingContributions(prev => [dest, ...prev]);
    addLog(`Added new contribution: ${dest.name}`);
  };

  const approveContribution = (id: string, editedDest?: Partial<Destination>) => {
    const dest = pendingContributions.find(d => d.id === id);
    if (dest) {
      const finalDest = { ...dest, ...editedDest, status: "published" as const };
      setDestinations(prev => [finalDest, ...prev]);
      setPendingContributions(prev => prev.filter(d => d.id !== id));
      addLog(`Approved contribution: ${finalDest.name}`);
    }
  };

  const rejectContribution = (id: string) => {
    const dest = pendingContributions.find(d => d.id === id);
    if (dest) {
      setPendingContributions(prev => prev.filter(d => d.id !== id));
      addLog(`Rejected contribution: ${dest.name}`);
    }
  };

  const loginAdmin = (admin: AdminUser) => {
    setLoggedAdmin(admin);
    addLog(`Admin logged in: ${admin.username}`);
  };

  const logoutAdmin = () => {
    if (loggedAdmin) addLog(`Admin logged out: ${loggedAdmin.username}`);
    setLoggedAdmin(null);
  };

  const addAdmin = (admin: AdminUser) => {
    setAdmins(prev => [...prev, admin]);
    addLog(`Added new admin: ${admin.username}`);
  };

  const deleteAdmin = (id: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
    addLog(`Deleted admin ID: ${id}`);
  };

  return (
    <DataContext.Provider value={{
      user, setUser, addReview,
      destinations, addDestination, updateDestination, deleteDestination,
      categories, addCategory, removeCategory,
      moodTags, addMoodTag, removeMoodTag,
      logs, addLog,
      pendingContributions, addContribution, approveContribution, rejectContribution,
      admins, loggedAdmin, loginAdmin, logoutAdmin, addAdmin, deleteAdmin
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
