import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations, useTexture } from "@react-three/drei";
import React, { useEffect, useState , useMemo } from "react";
import * as THREE from "three";



function PetModel(colors) {
    const { scene, animations, materials } = useGLTF("/models/testdog2.glb");
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

    }, [actions, materials, colors]);

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
    var offY= py * maxOffsetY
    materials.eye.map.offset.y = offY
    materials.eye.map.offset.x = -offX

    // map.needsUpdate = true; // usually not needed every frame, but safe if glitchy
  });

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