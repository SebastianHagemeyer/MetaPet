import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations } from "@react-three/drei";
import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";

// Accessory definitions with level requirements
const ACCESSORIES = [
  { id: null, name: "None", model: null, levelRequired: 1 },
  { id: "partyhat", name: "Party Hat", model: "/models/partyhattex.glb", levelRequired: 2 },
  { id: "wizhat", name: "Wizard Hat", model: "/models/wizhattex.glb", levelRequired: 3 },
  { id: "spinhat", name: "Spinner Hat", model: "/models/spinhattex.glb", levelRequired: 4 },
  // { id: "crown", name: "Crown", model: "/models/crown.glb", levelRequired: 5 }, // TODO: add crown model
];

// Preload accessory models
ACCESSORIES.forEach(acc => {
  if (acc.model) useGLTF.preload(acc.model);
});

function PetModel({ colors, accessory }) {
  const { scene, animations, materials } = useGLTF("/models/thebest.glb");
  const { actions, mixer } = useAnimations(animations, scene);
  const headBoneRef = useRef(null);
  const accessoryRef = useRef(null);

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
  }, [accessory?.type, accessory?.scale, accessoryGltf?.scene]);

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


  // Move pupil with mouse
  useFrame(({ pointer }) => {
    if (!materials.eye || !materials.eye.map) return;

    const map = materials.eye.map;

    // pointer.x / pointer.y are roughly -1..1
    const px = THREE.MathUtils.clamp(pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(pointer.y, -1, 1);

    // How far the iris can move in UV space
    const maxOffsetX = 0.02; // small, or it will slide off the sclera
    const maxOffsetY = 0.02;


    var offX = px * maxOffsetX
    var offY = py * maxOffsetY
    materials.eye.map.offset.y = offY
    materials.eye.map.offset.x = -offX

    // map.needsUpdate = true; // usually not needed every frame, but safe if glitchy
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
  const [currentAccessory, setCurrentAccessory] = useState({ type: null, scale: 0.8 });

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

      {/* Accessory Controls */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
        marginTop: "8px"
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
                  color: isUnlocked ? "#fff" : "#666",
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
            <label style={{ color: "#aaa" }}>Size:</label>
            <input
              type="range"
              min="0.5"
              max="1.1"
              step="0.05"
              value={currentAccessory.scale}
              onChange={(e) => handleScaleChange(e.target.value)}
              style={{ width: "150px" }}
            />
            <span style={{ color: "#fff", minWidth: "40px" }}>{currentAccessory.scale.toFixed(1)}x</span>
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
            background: "rgba(255,255,255,0.15)",
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
    </div>
  );
}
