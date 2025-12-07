// src/pages/Promo.jsx
// Promo video generator - cycles through hats, rainbow colors, random snaps, zoom in/out
// Exports frames as PNG for stitching into video/gif

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations } from "@react-three/drei";
import React, { useEffect, useState, useRef, useCallback } from "react";
import * as THREE from "three";
import { ACCESSORIES } from "/src/components/PetModel";

// PetModel for promo (copy from PetView but with animation)
function PetModel({ colors, accessory, frameProgress }) {
  const { scene, animations, materials } = useGLTF("/models/thebest.glb");
  const { actions } = useAnimations(animations, scene);
  const headBoneRef = useRef(null);
  const accessoryRef = useRef(null);
  const spinnerRef = useRef(null);

  const accessoryConfig = ACCESSORIES.find(a => a.id === accessory?.type);
  const accessoryGltf = useGLTF(accessoryConfig?.model || "/models/partyhattex.glb");

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isBone && (obj.name.toLowerCase().includes("head") || obj.name === "Head")) {
        headBoneRef.current = obj;
      }
    });
  }, [scene]);

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.name.toLowerCase().includes("tuft")) {
        obj.visible = !accessory?.type;
      }
    });
  }, [scene, accessory?.type]);

  useEffect(() => {
    const headBone = headBoneRef.current;
    if (accessoryRef.current && accessoryRef.current.parent) {
      accessoryRef.current.parent.remove(accessoryRef.current);
      accessoryRef.current = null;
    }

    if (headBone && accessory?.type && accessoryGltf?.scene) {
      const accessoryClone = accessoryGltf.scene.clone();
      const sliderVal = accessory.scale || 1.0;
      const t = Math.max(0, Math.min(1, (sliderVal - 0.5) / (1.1 - 0.5)));
      const scale = 0.5 + t * (0.8 - 0.5);
      accessoryClone.scale.set(scale, scale, scale);

      spinnerRef.current = null;
      accessoryClone.traverse((obj) => {
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

      accessoryClone.rotation.set(-1, 0, 0);
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

  // Setup walk animation - we control time manually via frameProgress
  const walkActionRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    const walkAction = actions["walkloop"];
    if (walkAction) {
      walkAction.reset();
      walkAction.setLoop(THREE.LoopRepeat);
      walkAction.play();
      walkAction.paused = true; // Pause it - we control time manually
      walkActionRef.current = walkAction;
      mixerRef.current = walkAction.getMixer();
    }
    return () => {
      if (walkAction) walkAction.stop();
    };
  }, [actions]);

  // Update animation time based on frame progress only
  useEffect(() => {
    if (walkActionRef.current && mixerRef.current) {
      const clipDuration = walkActionRef.current.getClip().duration;
      // 10 full walk cycles over the entire video
      const animTime = (frameProgress * 10 * clipDuration) % clipDuration;
      walkActionRef.current.time = animTime;
      mixerRef.current.update(0); // Force update without advancing time
    }
  }, [frameProgress]);

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

  const groupRef = useRef();

  // Set rotation based on frame progress, not real time
  useEffect(() => {
    if (spinnerRef.current) {
      // 20 full spinner rotations over entire video
      spinnerRef.current.rotation.y = frameProgress * Math.PI * 2 * 20;
    }
    if (groupRef.current) {
      // 5 full dog rotations over entire video
      groupRef.current.rotation.y = frameProgress * Math.PI * 2 * 5;
    }
  }, [frameProgress]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.6} />
    </group>
  );
}

// Camera controller for zoom animation
function CameraController({ zoomProgress }) {
  const { camera } = useThree();

  useFrame(() => {
    // Zoom between distance 4 and 6 (zoomed out so hat stays in frame)
    const minDist = 4;
    const maxDist = 6;
    const dist = minDist + (maxDist - minDist) * (0.5 + 0.5 * Math.sin(zoomProgress * Math.PI * 2));
    camera.position.normalize().multiplyScalar(dist);
    camera.updateProjectionMatrix();
  });

  return null;
}

// HSL to Hex conversion
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Random hex color
function randomHex() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

export default function Promo() {
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [totalFrames, setTotalFrames] = useState(9000); // 300 seconds at 30fps
  const [fps, setFps] = useState(30);
  const [frameDelay, setFrameDelay] = useState(1000); // 1 second between frames
  const [mode, setMode] = useState("rainbow"); // "rainbow" or "chaos"

  // Animation state
  const [colors, setColors] = useState({
    coat: "#3A8DFF",
    eye: "#FFFFFF",
    snout: "#222222",
  });
  const [accessory, setAccessory] = useState({ type: null, scale: 0.8, ass1: "#008EFF", ass2: "#ffff00" });
  const [zoomProgress, setZoomProgress] = useState(0);
  const [frameProgress, setFrameProgress] = useState(0);

  const frameRef = useRef(0);
  const lastSnapRef = useRef(0);
  const downloadLinkRef = useRef(null);

  // All hat types including none
  const hatTypes = ACCESSORIES.map(a => a.id);

  const captureFrame = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = downloadLinkRef.current;
    if (link) {
      link.href = dataUrl;
      link.download = `frame_${String(frameCount).padStart(5, '0')}.png`;
      link.click();
    }
  }, [frameCount]);

  // Animation loop when recording
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      frameRef.current += 1;
      const frame = frameRef.current;

      if (frame >= totalFrames) {
        setIsRecording(false);
        return;
      }

      const progress = frame / totalFrames;
      setFrameProgress(progress);

      // Zoom animation - smooth sine wave
      setZoomProgress(progress * 4); // 4 full zoom cycles

      if (mode === "rainbow") {
        // Rainbow color cycling (hue shifts over time)
        const hueBase = (progress * 360 * 3) % 360; // 3 full rainbow cycles

        // Smooth rainbow fade only
        setColors({
          coat: hslToHex((hueBase + 0) % 360, 70, 50),
          eye: hslToHex((hueBase + 120) % 360, 60, 70),
          snout: hslToHex((hueBase + 240) % 360, 50, 30),
        });
        setAccessory(prev => ({
          ...prev,
          ass1: hslToHex((hueBase + 60) % 360, 80, 55),
          ass2: hslToHex((hueBase + 180) % 360, 80, 55),
        }));

        // Cycle through hats - change every ~60 frames (2 seconds)
        const hatIndex = Math.floor((frame / 60) % hatTypes.length);
        setAccessory(prev => ({
          ...prev,
          type: hatTypes[hatIndex],
        }));
      } else if (mode === "chaos") {
        // Change dog every 6 frames (for 60fps = 10 dogs per second)
        if (frame % 6 === 0) {
          setColors({
            coat: randomHex(),
            eye: randomHex(),
            snout: randomHex(),
          });

          // Random hat
          const randomHatIndex = Math.floor(Math.random() * hatTypes.length);
          setAccessory({
            type: hatTypes[randomHatIndex],
            scale: 0.5 + Math.random() * 0.6, // random size 0.5-1.1
            ass1: randomHex(),
            ass2: randomHex(),
          });
        }
      }

      setFrameCount(frame);

      // Capture frame after a small delay to let render complete
      setTimeout(captureFrame, 100);

    }, frameDelay); // Use configurable delay between frames

    return () => clearInterval(interval);
  }, [isRecording, totalFrames, fps, captureFrame, hatTypes, frameDelay]);

  const startRecording = () => {
    frameRef.current = 0;
    lastSnapRef.current = 0;
    setFrameCount(0);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      <h1>Promo Video Generator</h1>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <div>
          <label>Total Frames: </label>
          <input
            type="number"
            value={totalFrames}
            onChange={(e) => setTotalFrames(parseInt(e.target.value) || 300)}
            style={{ width: "80px" }}
            disabled={isRecording}
          />
        </div>
        <div>
          <label>FPS: </label>
          <input
            type="number"
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value) || 30)}
            style={{ width: "60px" }}
            disabled={isRecording}
          />
        </div>
        <div>
          <label>Frame Delay (ms): </label>
          <input
            type="number"
            value={frameDelay}
            onChange={(e) => setFrameDelay(parseInt(e.target.value) || 1000)}
            style={{ width: "80px" }}
            disabled={isRecording}
          />
        </div>
        <div>
          Video Duration: {(totalFrames / fps).toFixed(1)}s | Record Time: {((totalFrames * frameDelay) / 1000 / 60).toFixed(1)} min
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", justifyContent: "center" }}>
        <button
          onClick={() => setMode("rainbow")}
          disabled={isRecording}
          style={{
            padding: "10px 20px",
            background: mode === "rainbow" ? "#4ade80" : "transparent",
            color: mode === "rainbow" ? "#000" : "inherit",
            border: "1px solid #555",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Rainbow Mode
        </button>
        <button
          onClick={() => setMode("chaos")}
          disabled={isRecording}
          style={{
            padding: "10px 20px",
            background: mode === "chaos" ? "#ff6b6b" : "transparent",
            color: mode === "chaos" ? "#000" : "inherit",
            border: "1px solid #555",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Chaos Mode (6 frames per dog)
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", justifyContent: "center" }}>
        {!isRecording ? (
          <button onClick={startRecording} style={{ padding: "12px 24px", fontSize: "1.1rem" }}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={{ padding: "12px 24px", fontSize: "1.1rem", background: "#ff4444" }}>
            Stop Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div style={{ marginBottom: "16px", fontSize: "1.2rem" }}>
          Recording: Frame {frameCount} / {totalFrames} ({Math.round(frameCount / totalFrames * 100)}%)
        </div>
      )}

      <div style={{ width: "1280px", height: "720px", margin: "0 auto" }}>
        <Canvas
          ref={canvasRef}
          shadows
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <Stage environment="city" intensity={0.7} adjustCamera={false} shadows={false}>
            <PetModel colors={colors} accessory={accessory} frameProgress={frameProgress} />
          </Stage>
          <OrbitControls enablePan={false} minDistance={2} maxDistance={4} />
          <CameraController zoomProgress={zoomProgress} />
        </Canvas>
      </div>

      {/* Hidden download link */}
      <a ref={downloadLinkRef} style={{ display: 'none' }} />

      <div style={{ marginTop: "16px", fontSize: "0.9rem", opacity: 0.7 }}>
        <p>Frames will auto-download as PNG files. Use ffmpeg to stitch:</p>
        <code style={{ display: "block", background: "#222", padding: "8px", borderRadius: "4px", marginTop: "8px" }}>
          ffmpeg -framerate 30 -i frame_%05d.png -c:v libx264 -pix_fmt yuv420p output.mp4
        </code>
      </div>
    </div>
  );
}
