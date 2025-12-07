// src/api/petsDb.js
import { ref, push, set, get, query, orderByChild, equalTo } from "firebase/database";
import { db } from "/src/lib/firebase";

// Generate a short ID like "GF123" or "ZN552"
function generateShortId() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O to avoid confusion
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(Math.random() * 900) + 100; // 100-999
  return `${letter1}${letter2}${numbers}`;
}

// Check if a shortId already exists for this user
async function shortIdExists(userId, shortId) {
  const listRef = ref(db, `users/${userId}/pets`);
  const snapshot = await get(listRef);

  if (!snapshot.exists()) return false;

  const data = snapshot.val();
  return Object.values(data).some((pet) => pet.shortId === shortId);
}

// Generate a unique short ID (retries if duplicate)
async function generateUniqueShortId(userId, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const shortId = generateShortId();
    const exists = await shortIdExists(userId, shortId);
    if (!exists) return shortId;
  }
  throw new Error("Could not generate unique short ID after " + maxAttempts + " attempts");
}

export async function getPetsFromDB(userId) {
  const listRef = ref(db, `users/${userId}/pets`);
  const snapshot = await get(listRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();
  // Convert object to array with id included
  return Object.entries(data).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}

export async function getPetByShortId(userId, shortId) {
  const listRef = ref(db, `users/${userId}/pets`);
  const snapshot = await get(listRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.val();
  for (const [key, value] of Object.entries(data)) {
    if (value.shortId === shortId) {
      return { id: key, ...value };
    }
  }
  return null;
}

export async function savePetToDB(userId, petData) {
  // /users/{userId}/pets/{autoKey}
  const listRef = ref(db, `users/${userId}/pets`);
  const newPetRef = push(listRef);

  const shortId = await generateUniqueShortId(userId);

  const payload = {
    ...petData,
    shortId,
    createdAt: Date.now(),
  };

  await set(newPetRef, payload);

  return { firebaseKey: newPetRef.key, shortId };
}

export async function updatePetInDB(userId, firebaseKey, updates) {
  const petRef = ref(db, `users/${userId}/pets/${firebaseKey}`);
  const snapshot = await get(petRef);

  if (!snapshot.exists()) {
    throw new Error("Pet not found");
  }

  const currentData = snapshot.val();
  const updatedData = { ...currentData, ...updates };

  await set(petRef, updatedData);
  return updatedData;
}

// --- IP-based adoption limiting ---

// Get user's IP from external service
export async function getUserIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch (err) {
    console.error("Failed to get IP:", err);
    return null;
  }
}

// Hash IP to avoid storing raw IPs (basic privacy)
function hashIP(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "ip_" + Math.abs(hash).toString(16);
}

// Check if an IP has already adopted
export async function hasIPAdopted(ip) {
  if (!ip) return false;

  const hashedIP = hashIP(ip);
  const ipRef = ref(db, `adoptedIPs/${hashedIP}`);
  const snapshot = await get(ipRef);

  return snapshot.exists();
}

// Record that an IP has adopted
export async function recordIPAdoption(ip, shortId) {
  if (!ip) return;

  const hashedIP = hashIP(ip);
  const ipRef = ref(db, `adoptedIPs/${hashedIP}`);

  await set(ipRef, {
    adoptedAt: Date.now(),
    petShortId: shortId,
  });
}
