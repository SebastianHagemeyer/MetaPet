// src/pages/Petz.jsx
import PetPreview from "/src/components/PetPreview";
import { getPetsFromDB } from "/src/api/petsDb";
import { useState, useEffect, useMemo } from "react";

// Calculate how many pets to show based on screen width
function getDisplayLimit(width) {
  if (width < 768) return 3;  // Mobile: 3 pets
  return 6;                   // PC/Desktop: 6 pets
}

export default function Petz() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [displayLimit, setDisplayLimit] = useState(() => getDisplayLimit(window.innerWidth));
  const [currentPage, setCurrentPage] = useState(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDisplayLimit(getDisplayLimit(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to first page when sort order or display limit changes
  useEffect(() => {
    setCurrentPage(0);
  }, [sortOrder, displayLimit]);

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

  // Sort and paginate pets
  const sortedPets = useMemo(() => {
    return [...pets].sort((a, b) => {
      const dateA = a.createdAt || 0;
      const dateB = b.createdAt || 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [pets, sortOrder]);

  const totalPages = Math.ceil(sortedPets.length / displayLimit);
  const displayedPets = sortedPets.slice(
    currentPage * displayLimit,
    (currentPage + 1) * displayLimit
  );

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className="page">
      <h1>All Petz</h1>
      <p>View all the MetaPetz!</p>

      {!loading && pets.length > 0 && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "15px" }}>
          <label htmlFor="sortOrder">Sort by:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      )}

      {loading ? (
        <div>Loading dogs…</div>
      ) : pets.length === 0 ? (
        <div>No pets found.</div>
      ) : (
        <>
          <div
            key={currentPage}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {displayedPets.map((pet) => (
              <PetPreview key={pet.id} pet={pet} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginTop: "20px"
            }}>
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!canGoPrev}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  background: canGoPrev ? "#4a90d9" : "#ccc",
                  color: "white",
                  cursor: canGoPrev ? "pointer" : "not-allowed",
                }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: "14px" }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!canGoNext}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  background: canGoNext ? "#4a90d9" : "#ccc",
                  color: "white",
                  cursor: canGoNext ? "pointer" : "not-allowed",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
