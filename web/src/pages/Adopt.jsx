import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations, useTexture } from "@react-three/drei";
import React, { useEffect, useState } from "react";

import dogBodyTexUrl from "/src/assets/models/dog1colm.png";
import dogEyeTexUrl from "/src/assets/models/THECOATCOL.png";

function PetModel(colors) {
    const { scene, animations, materials } = useGLTF("/src/assets/models/testdog.glb");
    const { actions } = useAnimations(animations, scene);

    const [bodyMap, eyeMap] = useTexture([dogBodyTexUrl, dogEyeTexUrl]);

    // Auto-play first animation if present
    React.useEffect(() => {
        //console.log("use effect")
        if (actions && Object.keys(actions).length > 0) {
            actions[Object.keys(actions)[0]].play(); // plays idle or whatever your first animation is
        }
        //console.log(scene);
        //console.log("materials:", materials); // check names once

        // APPLY TEXTURES TO MATERIALS
        if (materials.coat) {
            //materials.coat.map = bodyMap;
            materials.coat.color.set(colors.colors.coat);
            //materials.coat.color.set("#FF0"); // ← white = no tint
            materials.coat.needsUpdate = true;
        }
        if (materials.eye) {
            //materials.eye.map = eyeMap;
            materials.eye.color.set(colors.colors.eye);
            //materials.eye.color.set("#FF0"); // ← white = no tint
            materials.eye.needsUpdate = true;
        }
        if (materials.snout) {
            //materials.eyes.map = eyeMap;
            materials.snout.color.set(colors.colors.snout);
            //materials.snout.color.set("#FF0"); // ← white = no tint
            materials.snout.needsUpdate = true;
        }


    }, [actions, materials, bodyMap, eyeMap, colors]);

    return <primitive object={scene} scale={0.6} />;

}

export default function Adopt() {


    const randomHex = (brightness = 1) => {
        // clamp 0–1
        brightness = Math.min(1, Math.max(0, brightness));

        // generate RGB, scaled toward WHITE when brightness is high
        const r = Math.floor((Math.random() * brightness + (1 - brightness)) * 255);
        const g = Math.floor((Math.random() * brightness + (1 - brightness)) * 255);
        const b = Math.floor((Math.random() * brightness + (1 - brightness)) * 255);

        return (
            "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0")
        );
    };


    const [colors, setColors] = useState({
        coat: "#3A8DFF",
        eye: "#FFFFFF",
        snout: "#222222",
    });

    const randomize = () => {
        //console.log("Randomizing colors...");
        setColors({
            coat: randomHex(1),
            eye: randomHex(0.5),
            snout: randomHex(0.9),
        });
        //console.log(colors);
    };


    return (
        <div className="page">
            <h1>Adopt</h1>
            <p>Choose your MetaPet and customise it.</p>

            <button onClick={randomize} style={{
                padding: "10px 20px",
                marginBottom: "20px",
                fontSize: "1rem",
                borderRadius: "6px",
                cursor: "pointer",
            }}>
                🎲 Randomize Colors
            </button>

            <Canvas shadows camera={{ position: [2, 2, 3], fov: 40 }}>
                <Stage environment="city" intensity={0.7}>
                    <PetModel colors={colors} />
                </Stage>
                <OrbitControls enablePan={false} minDistance={2} maxDistance={4} />
            </Canvas>

        </div>
    )
}