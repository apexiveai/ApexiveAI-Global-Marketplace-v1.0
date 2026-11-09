"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RotateCcw, RotateCw } from "lucide-react";

function PlaceholderCar() {
  return (
    <group position={[0, -0.15, 0]}>
      <mesh position={[0, 0.61, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.5, 1.72]} />
        <meshPhysicalMaterial
          color="#d4d8dc"
          metalness={0.72}
          roughness={0.24}
          clearcoat={0.9}
        />
      </mesh>
      <mesh position={[-0.12, 1.02, 0]} castShadow>
        <boxGeometry args={[2.05, 0.7, 1.42]} />
        <meshPhysicalMaterial
          color="#73818d"
          metalness={0.55}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[-0.1, 1.04, 0]} castShadow>
        <boxGeometry args={[1.92, 0.53, 1.46]} />
        <meshPhysicalMaterial
          color="#172633"
          metalness={0.25}
          roughness={0.14}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh position={[1.45, 0.69, 0]} castShadow>
        <boxGeometry args={[0.75, 0.28, 1.62]} />
        <meshPhysicalMaterial color="#c5cbd0" metalness={0.68} roughness={0.23} />
      </mesh>
      <mesh position={[-1.88, 0.73, 0]} castShadow>
        <boxGeometry args={[0.06, 0.12, 0.35]} />
        <meshStandardMaterial color="#f4e3b1" emissive="#6e5521" />
      </mesh>
      <mesh position={[1.92, 0.73, 0]} castShadow>
        <boxGeometry args={[0.06, 0.13, 0.35]} />
        <meshStandardMaterial color="#b51d25" emissive="#451015" />
      </mesh>
      {[-1.2, 1.2].flatMap((x) =>
        [-0.88, 0.88].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0.4, z]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.39, 0.39, 0.24, 32]} />
              <meshStandardMaterial color="#111317" roughness={0.82} />
            </mesh>
            <mesh position={[0, z > 0 ? 0.13 : -0.13, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.025, 24]} />
              <meshStandardMaterial color="#aab2b8" metalness={0.88} roughness={0.22} />
            </mesh>
          </group>
        )),
      )}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0.78, 0.82, side * 0.85]} castShadow>
          <boxGeometry args={[0.2, 0.1, 0.14]} />
          <meshStandardMaterial color="#515b63" metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export default function VehicleOrbitViewer() {
  const controls = useRef<OrbitControlsImpl>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  function resetView() {
    controls.current?.reset();
    setAutoRotate(false);
  }

  return (
    <section
      aria-label="Interactive 3D vehicle preview"
      className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1219]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
        <div>
          <p className="text-[9px] tracking-[0.17em] text-amber-200">
            INTERACTIVE 3D PREVIEW
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Generic placeholder · not the listed vehicle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((current) => !current)}
            aria-pressed={autoRotate}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-[10px] text-slate-200 transition hover:border-amber-200/50 hover:text-white"
          >
            <RotateCw size={13} className={autoRotate ? "animate-spin" : ""} />
            {autoRotate ? "Stop rotation" : "Auto rotate"}
          </button>
          <button
            type="button"
            onClick={resetView}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-[10px] text-slate-200 transition hover:border-amber-200/50 hover:text-white"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>
      <div className="relative aspect-[4/3] min-h-64 touch-none">
        <Canvas
          camera={{ position: [5, 3.5, 6.5], fov: 40 }}
          dpr={[1, 1.6]}
          shadows
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-[#10151d] px-6 text-center text-xs text-slate-400">
              Interactive 3D is unavailable in this browser. Use the vehicle
              photos below instead.
            </div>
          }
        >
          <color attach="background" args={["#10151d"]} />
          <ambientLight intensity={1.25} />
          <directionalLight
            position={[4, 7, 5]}
            intensity={3}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-4, 3, -5]} intensity={1.2} color="#7c9cc5" />
          <gridHelper
            args={[16, 24, "#343b45", "#202630"]}
            position={[0, 0.01, 0]}
          />
          <PlaceholderCar />
          <OrbitControls
            ref={controls}
            target={[0, 0.55, 0]}
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={4}
            maxDistance={12}
            minPolarAngle={0.04}
            maxPolarAngle={Math.PI - 0.04}
            autoRotate={autoRotate}
            autoRotateSpeed={1.8}
          />
        </Canvas>
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-[9px] text-slate-300 backdrop-blur">
          Drag to orbit · Scroll or pinch to zoom · Tilt to view above or below
        </p>
      </div>
    </section>
  );
}
