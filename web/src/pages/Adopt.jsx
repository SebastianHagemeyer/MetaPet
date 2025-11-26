import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations } from "@react-three/drei";
import React, { useEffect } from "react";



function PetModel() {
    const { scene, animations } = useGLTF("/src/assets/models/dog1.glb");
    const { actions } = useAnimations(animations, scene);

    // Auto-play first animation if present
    React.useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            actions[Object.keys(actions)[0]].play(); // plays idle or whatever your first animation is
        }
    }, [actions]);

    return <primitive object={scene} scale={0.6} />;
}

export default function Adopt() {
    return (
        <div className="page">
            <h1>Adopt</h1>
            <p>Choose your MetaPet and customise it.</p>

            <Canvas shadows camera={{ position: [2, 2, 3], fov: 40 }}>
                <Stage environment="city" intensity={0.7}>
                    <PetModel />
                </Stage>
                <OrbitControls enablePan={false} minDistance={2} maxDistance={4} />
            </Canvas>

        </div>
    )
}