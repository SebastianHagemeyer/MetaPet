// src/components/CanvasCapture.jsx
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function CanvasCapture({ onCapture }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    // render one frame
    gl.render(scene, camera);
    // grab PNG data URL
    const dataUrl = gl.domElement.toDataURL("image/png");
    onCapture(dataUrl);
  }, [gl, scene, camera, onCapture]);

  return null;
}