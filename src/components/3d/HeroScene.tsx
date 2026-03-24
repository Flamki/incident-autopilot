import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function AnimatedSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.5}>
        <meshStandardMaterial
          color="#CCFF00"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
      <Sphere args={[0.95, 64, 64]} scale={2.5}>
        <meshStandardMaterial
          color="#7C3AED"
          transparent
          opacity={0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
    </Float>
  );
}

function Grid() {
  return (
    <gridHelper
      args={[100, 40, "#141414", "#D1D1D1"]}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function Particles({ count = 1000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  return (
    <Points positions={points}>
      <PointMaterial
        transparent
        color="#CCFF00"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function HeroScene() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#CCFF00" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7C3AED" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />
        
        <AnimatedSphere />
        <Grid />
        <Particles />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.2} />
      </Canvas>
    </div>
  );
}
