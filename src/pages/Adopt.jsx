import { useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

import { savePetToDB } from "/src/api/petsDb";

import randomIcon from "/src/assets/random.svg";

import { PET_NAMES , PET_DESCRIPTIONS} from "/src/data/petpresets";

// ------------- Pet Model -----------------

function PetModel({ colors }) {
    const { scene, animations, materials } = useGLTF("/models/thebest.glb");
    const { actions } = useAnimations(animations, scene);

    // --- Animation logic ---
    useEffect(() => {
        if (!actions || Object.keys(actions).length === 0) return;

        const ACTION_NAMES = ["sit", "wag", "walkloop"];

        Object.values(actions).forEach((a) => {
            a.reset();
            a.enabled = true;
            a.setEffectiveWeight(1);
            a.stop();
        });

        let currentName = null;
        let timeoutId = null;

        const pickNextName = () => {
            const pool = ACTION_NAMES.filter((n) => n !== currentName);
            return pool[Math.floor(Math.random() * pool.length)];
        };

        const play = (name) => {
            const action = actions[name];
            if (!action) return;

            if (currentName && actions[currentName] && currentName !== name) {
                actions[currentName].fadeOut(0.25);
            }

            const isLoopingWalk = name === "walkloop";

            action.reset();
            action.enabled = true;

            if (name === "wag") {
                action.setLoop(THREE.LoopPingPong, 2);
            } else {
                action.setLoop(isLoopingWalk ? THREE.LoopRepeat : THREE.LoopOnce);
            }

            action.clampWhenFinished = !isLoopingWalk;
            action.fadeIn(0.25).play();

            currentName = name;

            const clipDuration = action.getClip().duration;
            let cycles = 1;

            if (isLoopingWalk) {
                cycles = 1 + Math.floor(Math.random() * 3); // 1–3 cycles
            }

            const waitMs = (clipDuration * cycles + 1) * 1000;

            timeoutId = setTimeout(() => {
                const next = pickNextName();
                play(next);
            }, waitMs);
        };

        play("sit");

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            Object.values(actions).forEach((a) => a.stop());
        };
    }, [actions]);

    // --- Apply colours to materials ---
    useEffect(() => {
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

    // --- Eye texture settings (if mapped) ---
    useEffect(() => {
        if (!materials.eye || !materials.eye.map) return;
        const map = materials.eye.map;

        map.wrapS = THREE.ClampToEdgeWrapping;
        map.wrapT = THREE.ClampToEdgeWrapping;
        map.needsUpdate = true;
    }, [materials]);

    // --- Move pupil with mouse ---
    useFrame(({ pointer }) => {
        if (!materials.eye || !materials.eye.map) return;

        const map = materials.eye.map;

        const px = THREE.MathUtils.clamp(pointer.x, -1, 1);
        const py = THREE.MathUtils.clamp(pointer.y, -1, 1);

        const maxOffsetX = 0.02;
        const maxOffsetY = 0.02;

        const offX = px * maxOffsetX;
        const offY = py * maxOffsetY;

        map.offset.y = offY;
        map.offset.x = -offX;
    });

    return <primitive object={scene} scale={0.6} />;
}

// ------------- Adopt Page -----------------

export default function Adopt() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [savedPetId, setSavedPetId] = useState(null);


    const randomizeName = () => {
  const newName = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];

  setPet((prev) => ({
    ...prev,
    name: newName,
  }));
};

const randomizeDescription = () => {
  const newDescription =
    PET_DESCRIPTIONS[Math.floor(Math.random() * PET_DESCRIPTIONS.length)];

  setPet((prev) => ({
    ...prev,
    description: newDescription,
  }));
};


    const [pet, setPet] = useState({
        shortId: "GF123",
        name: "Gizmo",
        description: "Playful and curious little hound.",
        colors: {
            coat: "#3A8DFF",
            eye: "#FFFFFF",
            snout: "#222222",
        },
        level: 1,
        xp: 0,
        accessories: [], // Unlocked via leveling, managed in PetView
    });

    const userId = "demoUser"; // later: real auth uid

    // --- Colour randomiser ---
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

        return (
            "#" +
            Math.floor(r).toString(16).padStart(2, "0") +
            Math.floor(g).toString(16).padStart(2, "0") +
            Math.floor(b).toString(16).padStart(2, "0")
        );
    };

    const randomize = () => {
        setPet((prev) => ({
            ...prev,
            colors: {
                coat: randomHex(0.6),
                eye: randomHex(0.7),
                snout: randomHex(0.3),
            },
        }));
    };

    const handleColorChange = (key, value) => {
        setPet((prev) => ({
            ...prev,
            colors: {
                ...prev.colors,
                [key]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const result = await savePetToDB(userId, pet);
            console.log("Saved pet with key:", result);
            setSavedPetId(result.shortId);
        } catch (e) {
            console.error(e);
            setError("Failed to save pet");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page">
            <h1>Adopt</h1>
            <p>Choose your MetaPet and customise it.</p>

            {/* Pet meta */}
            <div className="petNameRow">
                <h2 className="petName">{pet.name}</h2>
                <img
                    src={randomIcon}
                    alt="Random"
                    className="diceIcon petNameDice"
                    onClick={randomizeName}
                />
            </div>

            <div className="petNameRow">
                <p className="petDescription">{pet.description}</p>
                <img
                    src={randomIcon}
                    alt="Random"
                    className="diceIcon petNameDice"
                    onClick={randomizeDescription}  
                />
            </div>



            {/* Controls Row */}
            <div
                className="controls"
            >
                {/*  Squares */}
                <div
                    style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                    }}
                >
                    {/* Randomize Button */}
                    <button
                        onClick={randomize}
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
                        Randomize Colors
                    </button>

                    {/* Coat  - coat*/}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <label style={{ cursor: "pointer" }}>
                            <div className="colorSquare"
                                style={{
                                    backgroundColor: pet.colors.coat,
                                }}
                            />

                            <input
                                type="color"
                                value={pet.colors.coat}
                                onChange={(e) => handleColorChange("coat", e.target.value)}
                                className="hiddenColorInput"
                            />

                        </label>
                    </div>

                    {/* Eyes  - eye*/}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <label style={{ cursor: "pointer" }}>
                            <div className="colorSquare"
                                style={{
                                    backgroundColor: pet.colors.eye,
                                }}
                            />

                            <input
                                type="color"
                                value={pet.colors.eye}
                                onChange={(e) => handleColorChange("eye", e.target.value)}
                                className="hiddenColorInput"
                            />

                        </label>
                    </div>

                    {/* Snout  - snout*/}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <label style={{ cursor: "pointer" }}>
                            <div className="colorSquare"
                                style={{
                                    backgroundColor: pet.colors.snout,
                                }}
                            />

                            <input
                                type="color"
                                value={pet.colors.snout}
                                onChange={(e) => handleColorChange("snout", e.target.value)}
                                className="hiddenColorInput"
                            />

                        </label>
                    </div>
                </div>
            </div>

            <Canvas shadows camera={{ position: [0, 0, 1], fov: 40 }}>
                <Stage environment="city" intensity={0.7} adjustCamera={false} shadows={false}>
                    <PetModel colors={pet.colors} />
                </Stage>
                <OrbitControls enablePan={false} minDistance={2} maxDistance={4} />
            </Canvas>

            <div style={{ marginTop: "16px" }}>
                {savedPetId ? (
                    <div style={{
                        padding: "16px",
                        backgroundColor: "#d4edda",
                        border: "1px solid #c3e6cb",
                        borderRadius: "8px",
                        color: "#155724",
                    }}>
                        <h3 style={{ margin: "0 0 8px 0" }}>Adoption Successful!</h3>
                        <p style={{ margin: "0 0 8px 0" }}>
                            Your pet <strong>{pet.name}</strong> has been adopted!
                        </p>
                        <p style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>
                            Pet ID: <strong style={{ fontFamily: "monospace", fontSize: "1.2rem" }}>{savedPetId}</strong>
                        </p>
                        <p style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontStyle: "italic" }}>
                            Make sure to write down this ID - you'll need it to find your pet!
                        </p>
                        <button
                            onClick={() => navigate(`/view/${savedPetId}`)}
                            style={{
                                padding: "10px 20px",
                                fontSize: "1rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                backgroundColor: "#155724",
                                color: "white",
                                border: "none",
                            }}
                        >
                            View Your Pet
                        </button>
                    </div>
                ) : (
                    <>
                        <button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Pet"}
                        </button>
                        {error && (
                            <p style={{ color: "red", marginTop: "8px" }}>
                                {error}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
