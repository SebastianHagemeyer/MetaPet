// src/components/PetPreview.jsx
//renamed test
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import PetThumbnailCanvas from "./PetThumbnailCanvas";

export default function PetPreview({ pet }) {
  const { id, shortId, name, description, colors, accessories } = pet;
  const accessory = accessories?.length > 0 ? accessories[0] : null;
  const [thumb, setThumb] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${shortId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
        position: "relative",
      }}
    >
      {showToast && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            backgroundColor: "var(--toast-bg, #333)",
            color: "var(--toast-color, #fff)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 10,
            animation: "fadeIn 0.2s ease",
          }}
        >
          Copied to clipboard!
        </div>
      )}

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
          <PetThumbnailCanvas colors={colors} accessory={accessory} onReady={setThumb} />
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
        <button
          onClick={handleShare}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #555",
            fontSize: "0.85rem",
            cursor: "pointer",
            background: "transparent",
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
}
