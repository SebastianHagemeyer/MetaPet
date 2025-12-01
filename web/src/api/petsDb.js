// src/api/petsDb.js
import { ref, push, set } from "firebase/database";
import { db } from "/src/lib/firebase";

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
