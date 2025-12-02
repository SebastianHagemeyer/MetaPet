// src/components/PetPreview.jsx
//renamed test
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import PetThumbnailCanvas from "./PetThumbnailCanvas";

export default function PetPreview({ pet }) {
  const { id, shortId, name, description, colors } = pet;
  const [thumb, setThumb] = useState(null);

  // optional: load from localStorage if you want persistence
  useEffect(() => {
    const stored = window.localStorage.getItem(`pet-thumb-${id}`);
    if (stored) setThumb(stored);
  }, [id]);

  const handleReady = (dataUrl) => {
    setThumb(dataUrl);
    window.localStorage.setItem(`pet-thumb-${id}`, dataUrl);
  };

  return (
    <div
      className="pet-card"
      style={{
        border: "1px solid #333",
        borderRadius: "10px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ width: "100%", height: "200px" }}>
        {thumb ? (
          <img
            src={thumb}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <PetThumbnailCanvas colors={colors} onReady={handleReady} />
        )}
      </div>

      <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{name}</h2>
      <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
        {description}
      </p>

      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <Link
          to={`/view/${shortId}`}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #555",
            fontSize: "0.85rem",
          }}
        >
          View
        </Link>
        <Link
          to={`/share/${shortId}`}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #555",
            fontSize: "0.85rem",
          }}
        >
          Share
        </Link>
      </div>
    </div>
  );
}
