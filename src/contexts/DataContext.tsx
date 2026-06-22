"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Destination, Review, mockDestinations } from "@/lib/data";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

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
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loggedAdmin, setLoggedAdmin] = useState<AdminUser | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Local state for UI only stuff
    const savedUser = localStorage.getItem("explore_pwk_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedCats = localStorage.getItem("explore_pwk_cats");
    if (savedCats) setCategories(JSON.parse(savedCats));
    const savedMoods = localStorage.getItem("explore_pwk_moods");
    if (savedMoods) setMoodTags(JSON.parse(savedMoods));
    const savedLogs = localStorage.getItem("explore_pwk_logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    const savedLoggedAdmin = localStorage.getItem("explore_pwk_logged_admin");
    if (savedLoggedAdmin) setLoggedAdmin(JSON.parse(savedLoggedAdmin));

    // Firestore Realtime Listeners
    const unsubDestinations = onSnapshot(collection(db, "destinations"), (snapshot) => {
      if (snapshot.empty) {
        // Seeding initial data
        mockDestinations.forEach(async (d) => {
          await setDoc(doc(db, "destinations", d.id), d);
        });
      } else {
        const data = snapshot.docs.map(doc => doc.data() as Destination);
        // Sort newest first based on id or just rely on Firebase (Firebase returns by doc ID usually)
        setDestinations(data.reverse());
      }
    });

    const unsubPending = onSnapshot(collection(db, "pending_contributions"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Destination);
      setPendingContributions(data.reverse());
    });

    const unsubAdmins = onSnapshot(collection(db, "admins"), (snapshot) => {
      if (snapshot.empty) {
        const initialAdmin = { id: "admin-1", username: "heru", password: "270623" };
        setDoc(doc(db, "admins", initialAdmin.id), initialAdmin);
      } else {
        const data = snapshot.docs.map(doc => doc.data() as AdminUser);
        setAdmins(data);
      }
    });

    setIsLoaded(true);

    return () => {
      unsubDestinations();
      unsubPending();
      unsubAdmins();
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("explore_pwk_user", JSON.stringify(user));
      localStorage.setItem("explore_pwk_cats", JSON.stringify(categories));
      localStorage.setItem("explore_pwk_moods", JSON.stringify(moodTags));
      localStorage.setItem("explore_pwk_logs", JSON.stringify(logs));
      localStorage.setItem("explore_pwk_logged_admin", JSON.stringify(loggedAdmin));
    }
  }, [user, categories, moodTags, logs, loggedAdmin, isLoaded]);

  const addDestination = async (dest: Destination) => {
    await setDoc(doc(db, "destinations", dest.id), dest);
    addLog(`Added new destination: ${dest.name}`);
  };

  const updateDestination = async (id: string, dest: Destination) => {
    await setDoc(doc(db, "destinations", id), dest);
    addLog(`Updated destination: ${dest.name}`);
  };

  const deleteDestination = async (id: string) => {
    const dest = destinations.find(d => d.id === id);
    await deleteDoc(doc(db, "destinations", id));
    if (dest) addLog(`Deleted destination: ${dest.name}`);
  };

  const addCategory = (cat: string) => setCategories(prev => [...prev, cat]);
  const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat));

  const addMoodTag = (tag: string) => setMoodTags(prev => [...prev, tag]);
  const removeMoodTag = (tag: string) => setMoodTags(prev => prev.filter(t => t !== tag));

  const addReview = async (destinationId: string, review: Review) => {
    const d = destinations.find(x => x.id === destinationId);
    if (d) {
      const newReviews = [...(d.reviews || []), review];
      const newTotal = (d.rating_and_reviews?.total_reviews || 0) + 1;
      const newAvg = (((d.rating_and_reviews?.average_rating || 0) * (d.rating_and_reviews?.total_reviews || 0)) + review.rating) / newTotal;
      const updated = {
        ...d,
        reviews: newReviews,
        rating_and_reviews: {
          average_rating: Number(newAvg.toFixed(1)),
          total_reviews: newTotal
        }
      };
      await setDoc(doc(db, "destinations", d.id), updated);
      addLog(`Added review for destination ${destinationId}`);
    }
  };

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleString("id-ID");
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev]);
  };

  const addContribution = async (dest: Destination) => {
    await setDoc(doc(db, "pending_contributions", dest.id), dest);
    addLog(`Added new contribution: ${dest.name}`);
  };

  const approveContribution = async (id: string, editedDest?: Partial<Destination>) => {
    const dest = pendingContributions.find(d => d.id === id);
    if (dest) {
      const finalDest = { ...dest, ...editedDest, status: "published" as const };
      await setDoc(doc(db, "destinations", finalDest.id), finalDest);
      await deleteDoc(doc(db, "pending_contributions", id));
      addLog(`Approved contribution: ${finalDest.name}`);
    }
  };

  const rejectContribution = async (id: string) => {
    const dest = pendingContributions.find(d => d.id === id);
    if (dest) {
      await deleteDoc(doc(db, "pending_contributions", id));
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

  const addAdmin = async (admin: AdminUser) => {
    await setDoc(doc(db, "admins", admin.id), admin);
    addLog(`Added new admin: ${admin.username}`);
  };

  const deleteAdmin = async (id: string) => {
    await deleteDoc(doc(db, "admins", id));
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
