// src/pages/Petz.jsx
import PetPreview from "/src/components/PetPreview";
import { getPetsFromDB } from "/src/api/petsDb";
import { useState, useEffect } from "react";

export default function Petz() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPetsFromDB("demoUser")
      .then((data) => {
        setPets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch pets:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1>All Petz</h1>
      <p>View all the MetaPetz!</p>

      {loading ? (
        <div>Loading dogs…</div>
      ) : pets.length === 0 ? (
        <div>No pets found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {pets.map((pet) => (
            <PetPreview key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
