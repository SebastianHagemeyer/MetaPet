// src/components/PetThumbnailCanvas.jsx
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import PetModel from "./PetModel";
import { CanvasCapture } from "./CanvasCapture";

export default function PetThumbnailCanvas({ colors, onReady }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 4]} intensity={0.8} />
        <PetModel colors={colors} />
        <CanvasCapture onCapture={onReady} />
      </Suspense>
    </Canvas>
  );
}
