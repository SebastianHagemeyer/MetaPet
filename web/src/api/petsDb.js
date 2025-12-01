// src/api/petsDb.js
import { ref, push, set, get } from "firebase/database";
import { db } from "/src/lib/firebase";

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

export async function savePetToDB(userId, petData) {
  // /users/{userId}/pets/{autoKey}
  const listRef = ref(db, `users/${userId}/pets`);
  const newPetRef = push(listRef);

  const payload = {
    ...petData,
    createdAt: Date.now(),
  };

  await set(newPetRef, payload);

  return newPetRef.key;
}
