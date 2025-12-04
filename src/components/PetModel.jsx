// src/components/PetModel.jsx
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import { SkeletonUtils } from "three-stdlib";

const MODEL_URL = "/models/thebest.glb";

// Accessory definitions with level requirements
export const ACCESSORIES = [
  { id: null, name: "None", model: null, levelRequired: 1 },
  { id: "partyhat", name: "Party Hat", model: "/models/partyhattex.glb", levelRequired: 1 },
  { id: "wizhat", name: "Wizard Hat", model: "/models/wizhattex.glb", levelRequired: 2 },
  { id: "spinhat", name: "Spinner Hat", model: "/models/spinhattex.glb", levelRequired: 3 },
  // { id: "crown", name: "Crown", model: "/models/crown.glb", levelRequired: 5 }, // TODO: add crown model
];

// Preload accessory models
ACCESSORIES.forEach(acc => {
  if (acc.model) useGLTF.preload(acc.model);
});

export default function PetModel({ colors, accessory }) {
  const { scene } = useGLTF(MODEL_URL);
  const headBoneRef = useRef(null);
  const accessoryRef = useRef(null);
  const spinnerRef = useRef(null);

  // Load accessory model if selected
  const accessoryConfig = ACCESSORIES.find(a => a.id === accessory?.type);
  const accessoryGltf = useGLTF(accessoryConfig?.model || "/models/partyhattex.glb");

  // clone scene + materials + textures
  const clonedScene = useMemo(() => {
    const root = SkeletonUtils.clone(scene);
    const materialMap = new Map();

    root.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;

      const makeMat = (mat) => {
        if (!materialMap.has(mat)) {
          const m = mat.clone();
          if (mat.map) {
            m.map = mat.map.clone();
            m.map.offset.set(0, 0);
            m.map.repeat.set(1, 1);
            m.map.rotation = 0;
            m.map.center.set(0.5, 0.5);
            m.map.needsUpdate = true;
          }
          materialMap.set(mat, m);
        }
        return materialMap.get(mat);
      };

      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map(makeMat);
      } else {
        obj.material = makeMat(obj.material);
      }
    });

    return root;
  }, [scene]);

  // Find head bone on mount
  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (obj.isBone && (obj.name.toLowerCase().includes("head") || obj.name === "Head")) {
        headBoneRef.current = obj;
      }
    });
  }, [clonedScene]);

  // Hide/show tuft based on accessory
  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (obj.name.toLowerCase().includes("tuft")) {
        obj.visible = !accessory?.type;
      }
    });
  }, [clonedScene, accessory?.type]);

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

  // apply colours to the cloned instance
  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mat = obj.material;

      if (mat.name === "coat" && colors.coat) mat.color.set(colors.coat);
      if (mat.name === "eye" && colors.eye) mat.color.set(colors.eye);
      if (mat.name === "snout" && colors.snout) mat.color.set(colors.snout);

      mat.needsUpdate = true;
    });
  }, [colors, clonedScene]);

  // Rotate spinner part continuously
  useFrame((_, delta) => {
    if (spinnerRef.current) {
      spinnerRef.current.rotation.y += delta * 3; // Adjust speed as needed
    }
  });

  return <primitive object={clonedScene} />;
}

useGLTF.preload(MODEL_URL);
