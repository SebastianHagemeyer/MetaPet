import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useAnimations, useTexture } from "@react-three/drei";
import React, { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

import { AnimationUtils } from "three"; // ← add at top

function PetModel(colors) {
  const { scene, animations, materials } = useGLTF("/models/thebest.glb");
  const { actions, mixer } = useAnimations(animations, scene);




  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const ACTION_NAMES = ["sit", "wag", "walkloop"];

    // Normalise once
    Object.values(actions).forEach(a => {
      a.reset();
      a.enabled = true;
      a.setEffectiveWeight(1);
      a.stop();
    });

    let currentName = null;
    let timeoutId = null;

    const pickNextName = () => {
      const pool = ACTION_NAMES.filter(n => n !== currentName);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const play = (name) => {
      const action = actions[name];
      if (!action) return;

      const wasCurrent = currentName && actions[currentName];

      // Fade out previous instead of hard stop
      if (wasCurrent && currentName !== name) {
        actions[currentName].fadeOut(0.25);
      }

      const isLoopingWalk = name === "walkloop";

      action.reset();
      action.enabled = true;

      if (name === "wag") {
        // if you want a ping-pong wag:
        action.setLoop(THREE.LoopPingPong, 2); // forward + back twice
      } else {
        action.setLoop(
          isLoopingWalk ? THREE.LoopRepeat : THREE.LoopOnce
        );
      }

      action.clampWhenFinished = !isLoopingWalk;

      action.fadeIn(0.25).play();

      currentName = name;

      // Use real clip duration
      const clipDuration = action.getClip().duration; // seconds

      let cycles = 1;
      if (isLoopingWalk) {
        // Keep walkloop around a bit
        cycles = 1 + Math.floor(Math.random() * 3); // 1–3 cycles
      }

      // +0.1 to give it breathing room to fully finish / reverse
      const waitMs = (clipDuration * cycles + 1) * 1000;

      timeoutId = setTimeout(() => {
        const next = pickNextName();
        play(next);
      }, waitMs);
    };

    // Start sequence
    play("sit");

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      Object.values(actions).forEach(a => a.stop());
    };
  }, [actions]);



  useEffect(() => {
    //console.log("use effect")


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
    var offY = py * maxOffsetY
    materials.eye.map.offset.y = offY
    materials.eye.map.offset.x = -offX

    // map.needsUpdate = true; // usually not needed every frame, but safe if glitchy
  });

  return <primitive object={scene} scale={0.6} />;

}






// src/pages/PetView.jsx
import { useParams, Navigate } from "react-router-dom";
import { getPetByShortId } from "/src/api/petsDb";

export default function PetView() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPetByShortId("demoUser", id)
      .then((data) => {
        setPet(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch pet:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  // Invalid id → hard 404 page
  if (!pet) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="page">
      <h1 style={{ margin: 0 }} >{pet.name}</h1>

      <p style={{ margin: 0 }}>{pet.description}</p>

      <Canvas key="special" shadows camera={{ position: [0, 0, 1], fov: 40 }}>
        <Stage environment="city" intensity={0.7} adjustCamera={false} shadows={false}>
          <PetModel colors={pet.colors} />
        </Stage>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={4} />
      </Canvas>


      {/* bottom cluster as ONE block */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,           // no flex gap between children
    paddingBottom: "50px"
  }}
>
  <p style={{ margin: 0 }}>Level {pet.level}</p>
  <p style={{ margin: 0 }}>{Math.round(pet.xp * 100)}%</p>

  <div
    style={{
      width: "350px",
      maxWidth: "100%",
      height: "14px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.15)",
      overflow: "hidden",
      margin: 0,      // just to be explicit
    }}
  >
    <div
      style={{
        width: `${pet.xp * 100}%`,
        height: "100%",
        background: "#4ade80",
        borderRadius: "999px",
      }}
    />
  </div>
</div>



    </div>
  );
}
