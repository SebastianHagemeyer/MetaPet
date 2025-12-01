// src/components/PetModel.jsx
import { useGLTF } from "@react-three/drei";
import { useMemo, useEffect } from "react";
import { SkeletonUtils } from "three-stdlib";

const MODEL_URL = "/models/thebest.glb";

export default function PetModel({ colors }) {
  const { scene } = useGLTF(MODEL_URL);

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

  return <primitive object={clonedScene} />;
}

useGLTF.preload(MODEL_URL);
