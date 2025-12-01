// src/pages/Petz.jsx
import PetPreview from "/src/components/PetPreview";
import { pets } from "/src/data/pets";
import { Suspense } from "react";

export default function Petz() {
  return (
    <div className="page">
      <h1>All Petz</h1>
      <p>View all the MetaPetz!</p>

      <Suspense fallback={<div>Loading dogs…</div>}>
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
      </Suspense>
    </div>
  );
}
