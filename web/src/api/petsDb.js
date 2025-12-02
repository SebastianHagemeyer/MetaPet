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
