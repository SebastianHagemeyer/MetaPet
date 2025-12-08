import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations } from "@react-three/drei";
import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import QRCode from "react-qr-code";
import { ACCESSORIES } from "/src/components/PetModel";

function PetModel({ colors, accessory }) {
  const { scene, animations, materials } = useGLTF("/models/thebest.glb");
  const { actions, mixer } = useAnimations(animations, scene);
  const headBoneRef = useRef(null);
  const accessoryRef = useRef(null);
  const spinnerRef = useRef(null);

  // Load accessory model if selected
  const accessoryConfig = ACCESSORIES.find(a => a.id === accessory?.type);
  const accessoryGltf = useGLTF(accessoryConfig?.model || "/models/partyhattex.glb");

  // Find head bone on mount
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isBone && (obj.name.toLowerCase().includes("head") || obj.name === "Head")) {
        headBoneRef.current = obj;
        console.log("Found head bone:", obj.name);
      }
    });
    // Debug: log all bone names
    scene.traverse((obj) => {
      if (obj.isBone) {
        console.log("Bone:", obj.name);
      }
    });
  }, [scene]);

  // Hide/show tuft based on accessory
  useEffect(() => {
    scene.traverse((obj) => {
      // Check for tuft group or mesh
      if (obj.name.toLowerCase().includes("tuft")) {
        obj.visible = !accessory?.type;
      }
    });
  }, [scene, accessory?.type]);

  // Attach/detach accessory to head bone
  useEffect(() => {
    const headBone = headBoneRef.current;

    // Remove previous accessory if exists
    if (accessoryRef.current && accessoryRef.current.parent) {
      accessoryRef.current.parent.remove(accessoryRef.current);
      accessoryRef.current = null;
    }

    // Add new accessory if selected and head bone found
    if (headBone && accessory?.type && accessoryGltf?.scene) {
      const accessoryClone = accessoryGltf.scene.clone();

      // Apply scale from accessory settings
      // Slider is 0.5 to 1.1, remap to actual scale: 0.5 -> 0.5, 1.1 -> 0.8
      const sliderVal = accessory.scale || 1.0;
      const t = Math.max(0, Math.min(1, (sliderVal - 0.5) / (1.1 - 0.5))); // 0 to 1
      const scale = 0.5 + t * (0.8 - 0.5); // 0.5 to 0.8
      accessoryClone.scale.set(scale, scale, scale);

      // Apply accessory colors and find spinner part
      spinnerRef.current = null;
      accessoryClone.traverse((obj) => {
        // Look for the spinning part (check for common names)
        if (obj.name.toLowerCase().includes("spin") || obj.name.toLowerCase().includes("top") || obj.name.toLowerCase().includes("propeller")) {
          spinnerRef.current = obj;
        }
        if (obj.isMesh && obj.material) {
          const mat = obj.material.clone();
          if (mat.name === "ass1" && accessory.ass1) {
            mat.color.set(accessory.ass1);
          }
          if (mat.name === "ass2" && accessory.ass2) {
            mat.color.set(accessory.ass2);
          }
          obj.material = mat;
        }
      });

      // Rotation offset (in radians) - tilt forward/back to sit on head properly
      // X = pitch (tilt forward/back), Y = yaw (spin), Z = roll (tilt side)
      accessoryClone.rotation.set(-1, 0, 0);

      // Position offset from head bone (Y decreases as scale increases so big hats don't float)
      const yOffset = 0.35 - (scale - 0.5) * 0.15;
      accessoryClone.position.set(0, yOffset, -0.75);

      headBone.add(accessoryClone);
      accessoryRef.current = accessoryClone;
    }

    return () => {
      if (accessoryRef.current && accessoryRef.current.parent) {
        accessoryRef.current.parent.remove(accessoryRef.current);
      }
    };
  }, [accessory?.type, accessory?.scale, accessory?.ass1, accessory?.ass2, accessoryGltf?.scene]);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const ACTION_NAMES = ["sit", "wag", "walkloop"];

    // Normalise once
    Object.values(actions).forEach(a => {
      a.reset();
      a.enabled = true;
      a.setEffectiveWeight(1);
      a.stop();
    });

    let currentName = null;
    let timeoutId = null;

    const pickNextName = () => {
      const pool = ACTION_NAMES.filter(n => n !== currentName);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const play = (name) => {
      const action = actions[name];
      if (!action) return;

      const wasCurrent = currentName && actions[currentName];

      // Fade out previous instead of hard stop
      if (wasCurrent && currentName !== name) {
        actions[currentName].fadeOut(0.25);
      }

      const isLoopingWalk = name === "walkloop";

      action.reset();
      action.enabled = true;

      if (name === "wag") {
        // if you want a ping-pong wag:
        action.setLoop(THREE.LoopPingPong, 2); // forward + back twice
      } else {
        action.setLoop(
          isLoopingWalk ? THREE.LoopRepeat : THREE.LoopOnce
        );
      }

      action.clampWhenFinished = !isLoopingWalk;

      action.fadeIn(0.25).play();

      currentName = name;

      // Use real clip duration
      const clipDuration = action.getClip().duration; // seconds

      let cycles = 1;
      if (isLoopingWalk) {
        // Keep walkloop around a bit
        cycles = 1 + Math.floor(Math.random() * 3); // 1–3 cycles
      }

      // +0.1 to give it breathing room to fully finish / reverse
      const waitMs = (clipDuration * cycles + 1) * 1000;

      timeoutId = setTimeout(() => {
        const next = pickNextName();
        play(next);
      }, waitMs);
    };

    // Start sequence
    play("sit");

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      Object.values(actions).forEach(a => a.stop());
    };
  }, [actions]);



  useEffect(() => {
    // APPLY TEXTURES TO MATERIALS
    if (materials.coat) {
      materials.coat.color.set(colors.coat);
      materials.coat.needsUpdate = true;
    }
    if (materials.eye) {
      materials.eye.color.set(colors.eye);
      materials.eye.needsUpdate = true;
    }
    if (materials.snout) {
      materials.snout.color.set(colors.snout);
      materials.snout.needsUpdate = true;
    }
  }, [materials, colors]);

  useEffect(() => {
    if (!materials.eye || !materials.eye.map) return;

    const map = materials.eye.map;

    // Don’t tile, don’t wrap around
    map.wrapS = THREE.ClampToEdgeWrapping;
    map.wrapT = THREE.ClampToEdgeWrapping;

    // Assume iris is initially centred in its UV patch
    // (you’ll tweak numbers below to match your texture layout)
    map.needsUpdate = true;
  }, [materials.eye]);

  /*
    useFrame(({ clock }) => {
    if (!materials.eye || !materials.eye.map) return;
  
    const t = clock.elapsedTime;
  
    //materials.eye.map.offset.x = 0.083 + Math.sin(t) * 0.05;
    materials.eye.map.offset.x = 0.002 + Math.sin(t) * 0.002;
    //materials.eye.map.offset.y = 0.5 + Math.cos(t) * 0.05;
    materials.eye.map.offset.y = 0
  }); */


  // Move pupil with mouse + rotate spinner
  useFrame(({ pointer }, delta) => {
    // Rotate spinner part if present
    if (spinnerRef.current) {
      spinnerRef.current.rotation.y += delta * 3;
    }

    if (!materials.eye || !materials.eye.map) return;

    const map = materials.eye.map;

    // How far the iris can move in UV space
    const maxOffsetX = 0.02; // small, or it will slide off the sclera
    const maxOffsetY = 0.02;

    // Threshold - if pointer goes beyond this, start returning to center
    const threshold = 0.8;
    const isOutside = Math.abs(pointer.x) > threshold || Math.abs(pointer.y) > threshold;

    let targetX, targetY;
    if (isOutside) {
      // Tween back to center
      targetX = 0;
      targetY = 0;
    } else {
      // Follow the pointer (scale to use full range within threshold)
      const px = pointer.x / threshold;
      const py = pointer.y / threshold;
      targetX = -px * maxOffsetX;
      targetY = py * maxOffsetY;
    }

    // Lerp for smooth transition
    const lerpSpeed = 5 * delta;
    map.offset.x = THREE.MathUtils.lerp(map.offset.x, targetX, lerpSpeed);
    map.offset.y = THREE.MathUtils.lerp(map.offset.y, targetY, lerpSpeed);
  });

  return <primitive object={scene} scale={0.6} />;

}






// src/pages/PetView.jsx
import { useParams, Navigate } from "react-router-dom";
import { getPetByShortId, updatePetInDB } from "/src/api/petsDb";

export default function PetView() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local accessory state for UI (first accessory in array, or default)
  const [currentAccessory, setCurrentAccessory] = useState({ type: null, scale: 0.8, ass1: "#008EFF", ass2: "#ffff00" });
  const [accessoriesExpanded, setAccessoriesExpanded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/view/${id}`
      : `/view/${id}`;

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  useEffect(() => {
    getPetByShortId("demoUser", id)
      .then((data) => {
        setPet(data);
        // Load first accessory from pet data if exists
        if (data?.accessories?.length > 0) {
          setCurrentAccessory(data.accessories[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch pet:", err);
        setLoading(false);
      });
  }, [id]);

  // Get accessories unlocked at current level
  const unlockedAccessories = ACCESSORIES.filter(acc => acc.levelRequired <= (pet?.level || 1));

  const handleAccessoryChange = (accessoryId) => {
    setCurrentAccessory(prev => ({ ...prev, type: accessoryId }));
  };

  const handleScaleChange = (scale) => {
    setCurrentAccessory(prev => ({ ...prev, scale: parseFloat(scale) }));
  };

  const handleAccessoryColorChange = (key, value) => {
    setCurrentAccessory(prev => ({ ...prev, [key]: value }));
  };

  // Randomize accessory colors
  const randomHex = (brightness = 0.5) => {
    brightness = Math.min(1, Math.max(0, brightness));
    let r = Math.random() * 255;
    let g = Math.random() * 255;
    let b = Math.random() * 255;
    if (brightness < 0.5) {
      const factor = brightness / 0.5;
      r *= factor;
      g *= factor;
      b *= factor;
    } else if (brightness > 0.5) {
      const factor = (brightness - 0.5) / 0.5;
      r = r + (255 - r) * factor;
      g = g + (255 - g) * factor;
      b = b + (255 - b) * factor;
    }
    return "#" + Math.floor(r).toString(16).padStart(2, "0") +
                 Math.floor(g).toString(16).padStart(2, "0") +
                 Math.floor(b).toString(16).padStart(2, "0");
  };

  const randomizeAccessoryColors = () => {
    setCurrentAccessory(prev => ({
      ...prev,
      ass1: randomHex(0.6),
      ass2: randomHex(0.6),
    }));
  };

  const handleSaveAccessory = async () => {
    if (!pet) return;
    setSaving(true);
    try {
      const newAccessories = currentAccessory.type
        ? [currentAccessory]
        : [];
      await updatePetInDB("demoUser", pet.id, { accessories: newAccessories });
      setPet(prev => ({ ...prev, accessories: newAccessories }));
    } catch (err) {
      console.error("Failed to save accessory:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  // Invalid id → hard 404 page
  if (!pet) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="page">
      <h1 style={{ margin: 0 }} >{pet.name}</h1>

      <p style={{ margin: 0 }}>{pet.description}</p>

      <Canvas key="special" shadows camera={{ position: [0, 0, 1], fov: 40 }}>
        <Stage environment="city" intensity={0.7} adjustCamera={false} shadows={false}>
          <PetModel colors={pet.colors} accessory={currentAccessory} />
        </Stage>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={4} />
      </Canvas>

      {/* Accessories Toggle Button + Share */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "8px" }}>
        <button
          onClick={() => setAccessoriesExpanded(!accessoriesExpanded)}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Accessories
          <span style={{
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: accessoriesExpanded ? "rotate(180deg)" : "rotate(0deg)"
          }}>
            ▼
          </span>
        </button>
        <button
          onClick={() => setShowShare(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Share
        </button>
      </div>

      {/* Accessory Controls - Collapsible */}
      {accessoriesExpanded && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "16px",
        }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {ACCESSORIES.map(acc => {
              const isUnlocked = acc.levelRequired <= pet.level;
              const isSelected = currentAccessory.type === acc.id;
              return (
                <button
                  key={acc.id || "none"}
                  onClick={() => isUnlocked && handleAccessoryChange(acc.id)}
                  disabled={!isUnlocked}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: isSelected ? "2px solid #4ade80" : "1px solid #555",
                    background: isSelected ? "rgba(74, 222, 128, 0.2)" : "rgba(255,255,255,0.1)",
                    cursor: isUnlocked ? "pointer" : "not-allowed",
                    opacity: isUnlocked ? 1 : 0.5,
                  }}
                >
                  {acc.name}
                  {!isUnlocked && ` (Lvl ${acc.levelRequired})`}
                </button>
              );
            })}
          </div>

          {/* Size slider - only show if accessory selected */}
          {currentAccessory.type && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <label>Size:</label>
              <input
                type="range"
                min="0.5"
                max="1.1"
                step="0.05"
                value={currentAccessory.scale}
                onChange={(e) => handleScaleChange(e.target.value)}
                style={{ width: "150px" }}
              />
              <span style={{ minWidth: "40px" }}>{currentAccessory.scale.toFixed(1)}x</span>
            </div>
          )}

          {/* Accessory color pickers - only show if accessory selected */}
          {currentAccessory.type && (
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Randomize button */}
              <button
                onClick={randomizeAccessoryColors}
                style={{
                  padding: "10px 20px",
                  fontSize: "1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Randomize
              </button>

              {/* ass1 color */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <label style={{ cursor: "pointer" }}>
                  <div
                    className="colorSquare"
                    style={{ backgroundColor: currentAccessory.ass1 }}
                  />
                  <input
                    type="color"
                    value={currentAccessory.ass1}
                    onChange={(e) => handleAccessoryColorChange("ass1", e.target.value)}
                    className="hiddenColorInput"
                  />
                </label>
              </div>

              {/* ass2 color */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <label style={{ cursor: "pointer" }}>
                  <div
                    className="colorSquare"
                    style={{ backgroundColor: currentAccessory.ass2 }}
                  />
                  <input
                    type="color"
                    value={currentAccessory.ass2}
                    onChange={(e) => handleAccessoryColorChange("ass2", e.target.value)}
                    className="hiddenColorInput"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSaveAccessory}
            disabled={saving}
            style={{
              padding: "10px 24px",
              borderRadius: "6px",
              background: "#4ade80",
              color: "#000",
              border: "none",
              cursor: saving ? "wait" : "pointer",
              fontWeight: "bold",
            }}
          >
            {saving ? "Saving..." : "Save Accessory"}
          </button>
        </div>
      )}

      {/* bottom cluster as ONE block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          paddingBottom: "50px"
        }}
      >
        <p style={{ margin: 0 }}>Level {pet.level}</p>
        <p style={{ margin: 0 }}>{Math.round(pet.xp * 100)}%</p>

        <div
          style={{
            width: "350px",
            maxWidth: "100%",
            height: "14px",
            borderRadius: "999px",
            background: "rgba(128,128,128,0.25)",
            overflow: "hidden",
            margin: 0,
          }}
        >
          <div
            style={{
              width: `${pet.xp * 100}%`,
              height: "100%",
              background: "#4ade80",
              borderRadius: "999px",
            }}
          />
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div
          className="share-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowShare(false)}
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal__header">
              <h3>Share This Pet</h3>
              <button
                className="share-modal__close"
                onClick={() => setShowShare(false)}
                aria-label="Close share dialog"
              >
                ×
              </button>
            </div>
            <p className="share-modal__sub">
              Scan to view in VR headset or open the link in any browser to see this pet.
            </p>
            <div className="share-modal__qr">
              <QRCode value={shareUrl} size={180} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              <div
                className="share-modal__id share-modal__id--clickable"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(id);
                    setToastMsg("Code copied!");
                  } catch (err) {
                    console.error("Failed to copy:", err);
                  }
                }}
              >
                Pet ID: {id}
              </div>
            </div>
            <div className="share-modal__actions">
              <input className="share-modal__link" value={shareUrl} readOnly />
              <button
                className="share-modal__button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setToastMsg("Link copied!");
                  } catch (err) {
                    console.error("Failed to copy:", err);
                  }
                }}
              >
                Copy Link
              </button>
              <button
                className="share-modal__button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(id);
                    setToastMsg("Code copied!");
                  } catch (err) {
                    console.error("Failed to copy:", err);
                  }
                }}
              >
                Copy Code
              </button>
            </div>
            {toastMsg && (
              <div className="share-modal__toast">{toastMsg}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
