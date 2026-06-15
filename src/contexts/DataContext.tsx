"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Destination, mockDestinations } from "@/lib/data";

interface DataContextType {
  destinations: Destination[];
  addDestination: (dest: Destination) => void;
  updateDestination: (id: string, dest: Destination) => void;
  deleteDestination: (id: string) => void;
  
  categories: string[];
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  
  moodTags: string[];
  addMoodTag: (tag: string) => void;
  removeMoodTag: (tag: string) => void;

  logs: string[];
  addLog: (log: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<string[]>(["Alam", "Rekreasi Air", "Keluarga", "Sejarah", "Kuliner"]);
  const [moodTags, setMoodTags] = useState<string[]>(["Healing", "Santai", "Keluarga", "Romantis", "Menikmati Sunset", "Petualangan", "Kuliner"]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
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

    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes (if loaded)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("explore_pwk_destinations", JSON.stringify(destinations));
      localStorage.setItem("explore_pwk_cats", JSON.stringify(categories));
      localStorage.setItem("explore_pwk_moods", JSON.stringify(moodTags));
      localStorage.setItem("explore_pwk_logs", JSON.stringify(logs));
    }
  }, [destinations, categories, moodTags, logs, isLoaded]);

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

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleString("id-ID");
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      destinations, addDestination, updateDestination, deleteDestination,
      categories, addCategory, removeCategory,
      moodTags, addMoodTag, removeMoodTag,
      logs, addLog
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
