import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations, useTexture } from "@react-three/drei";
import React, { useEffect, useState , useMemo } from "react";


function PetModel(colors) {
    const { scene, animations, materials } = useGLTF("/src/assets/models/testdog.glb");
    const { actions } = useAnimations(animations, scene);


    // Auto-play first animation if present
    React.useEffect(() => {
        //console.log("use effect")
        if (actions && Object.keys(actions).length > 0) {
            actions[Object.keys(actions)[0]].play(); // plays idle or whatever your first animation is
        }
        // APPLY TEXTURES TO MATERIALS
        if (materials.coat) {

            materials.coat.color.set(colors.colors.coat);

            materials.coat.needsUpdate = true;
        }
        if (materials.eye) {

            materials.eye.color.set(colors.colors.eye);

            materials.eye.needsUpdate = true;
        }
        if (materials.snout) {
            //materials.eyes.map = eyeMap;
            materials.snout.color.set(colors.colors.snout);

            materials.snout.needsUpdate = true;
        }

    }, [actions, materials, bodyMap, eyeMap, colors]);

    return <primitive object={scene} scale={0.6} />;

}


export default function Adopt() {

    const randomHex = (brightness = 0.5) => {
        brightness = Math.min(1, Math.max(0, brightness));

        // raw random color
        let r = Math.random() * 255;
        let g = Math.random() * 255;
        let b = Math.random() * 255;

        if (brightness < 0.5) {
            // DARKEN: scale colour down
            const factor = brightness / 0.5; // 0→black, 0.5→original
            r *= factor;
            g *= factor;
            b *= factor;
        } else if (brightness > 0.5) {
            // LIGHTEN: blend toward white
            const factor = (brightness - 0.5) / 0.5; // 0.5→none, 1→full pastel push
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


    const [colors, setColors] = useState({
        coat: "#3A8DFF",
        eye: "#FFFFFF",
        snout: "#222222",
    });

    const randomize = () => {

        setColors({
            coat: randomHex(0.6),
            eye: randomHex(0.7),
            snout: randomHex(0.3),
        });

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
                Randomize Colors
            </button>

            <Canvas shadows camera={{ position: [0, 0, 1], fov: 40 }}>
                <Stage environment="city" intensity={0.7} adjustCamera={false}>
                    <PetModel colors={colors} />
                </Stage>
                <OrbitControls enablePan={false} minDistance={2} maxDistance={4} />
            </Canvas>

        </div>
    )
}