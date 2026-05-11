"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Line, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  MOLECULAR_NODES, MOLECULAR_BONDS, RING_RADII,
  getBasePosition,
} from '@/lib/molecular-graph';
import { ENTERPRISES, type EnterpriseId, type EnterpriseConfig } from '@/types';

type Theme = 'dark' | 'light';

// ===== Enterprise color mapping (hex for Three.js) =====
const ENTERPRISE_COLORS: Record<EnterpriseId, string> = {
  'ford-canada': '#3B82F6',          // blue-500
  'lincoln': '#F59E0B',              // amber-500
  'dealership-network': '#10B981',   // emerald-500
};

const NUCLEUS_COLOR = '#FF7A1A'; // STRATIS orange brand accent

// The 3 tier nodes from the existing graph are visually superseded by the enterprise atoms,
// so we hide their scaffolding versions and re-render enterprise atoms at clean 120° spacing
// on their own ring (between the molecule rings, distinct from the inner Fibonacci-sphere clutter).
const REPLACED_NODE_IDS = new Set(['tier-1', 'tier-2', 'tier-3']);

// Custom enterprise triangle — facing the camera so all 3 nodes are visible from the start.
// Sits on a plane near z=2 (slightly in front of nucleus) at 120° spacing in the XY plane.
const ENTERPRISE_RING_RADIUS = 11;
const ENTERPRISE_FRONT_OFFSET = 2; // small Z push toward camera so they sit in front of decorative shells
const ENTERPRISE_ANGLES: Record<EnterpriseId, number> = {
  'ford-canada': Math.PI / 2,                            // top
  'lincoln': Math.PI / 2 - (Math.PI * 2) / 3,            // bottom-right
  'dealership-network': Math.PI / 2 + (Math.PI * 2) / 3, // bottom-left
};

function enterpriseAnchorPosition(id: EnterpriseId): [number, number, number] {
  const angle = ENTERPRISE_ANGLES[id];
  return [
    Math.cos(angle) * ENTERPRISE_RING_RADIUS,
    Math.sin(angle) * ENTERPRISE_RING_RADIUS,
    ENTERPRISE_FRONT_OFFSET,
  ];
}

// ===== Decorative scaffolding (atoms + bonds) =====
// Renders all ~70 decorative atoms in TWO instanced draw calls (outer shells + cores)
// instead of 140 separate meshes, and all ~250 decorative bonds as a SINGLE LineSegments.
// Static positions — no per-frame motion. The OrbitControls auto-rotate provides motion
// for the entire scene at zero per-atom cost.

function DecorativeScaffolding() {
  const outerRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.InstancedMesh>(null);

  const decorativeNodes = useMemo(
    () => MOLECULAR_NODES.filter((n) => n.ring !== 0 && !REPLACED_NODE_IDS.has(n.id)),
    [],
  );

  // Build instance transforms + per-instance colors once
  const { count, matricesOuter, matricesCore, colors } = useMemo(() => {
    const colorArr: number[] = [];
    const matsOuter: THREE.Matrix4[] = [];
    const matsCore: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    const tmpColor = new THREE.Color();

    for (const node of decorativeNodes) {
      const [x, y, z] = getBasePosition(node.id);
      const vizRadius = node.ring === 1 ? 0.55 :
                        node.ring === 2 ? 0.45 :
                        node.ring === 3 ? 0.40 :
                        node.ring === 4 ? 0.32 : 0.28;

      // Outer shell: scaled to vizRadius (base sphere geometry has r=1)
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(vizRadius);
      dummy.updateMatrix();
      matsOuter.push(dummy.matrix.clone());

      // Core: 32% of vizRadius
      dummy.scale.setScalar(vizRadius * 0.32);
      dummy.updateMatrix();
      matsCore.push(dummy.matrix.clone());

      tmpColor.set(node.color);
      colorArr.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }

    return {
      count: decorativeNodes.length,
      matricesOuter: matsOuter,
      matricesCore: matsCore,
      colors: new Float32Array(colorArr),
    };
  }, [decorativeNodes]);

  // Apply instance matrices + colors once on mount
  React.useEffect(() => {
    if (outerRef.current) {
      for (let i = 0; i < count; i++) outerRef.current.setMatrixAt(i, matricesOuter[i]);
      outerRef.current.instanceMatrix.needsUpdate = true;
      const colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
      outerRef.current.instanceColor = colorAttr;
    }
    if (coreRef.current) {
      for (let i = 0; i < count; i++) coreRef.current.setMatrixAt(i, matricesCore[i]);
      coreRef.current.instanceMatrix.needsUpdate = true;
      const colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
      coreRef.current.instanceColor = colorAttr;
    }
  }, [count, matricesOuter, matricesCore, colors]);

  // Single LineSegments geometry combining all decorative bonds (skip the 3 enterprise-anchor bonds — those render separately)
  const decorativeBondGeometry = useMemo(() => {
    const positions: number[] = [];
    for (const bond of MOLECULAR_BONDS) {
      if (REPLACED_NODE_IDS.has(bond.source) || REPLACED_NODE_IDS.has(bond.target)) continue;
      const a = getBasePosition(bond.source);
      const b = getBasePosition(bond.target);
      positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, []);

  return (
    <>
      {/* Outer shells — single instanced draw call */}
      <instancedMesh ref={outerRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.18} depthWrite={false} vertexColors />
      </instancedMesh>
      {/* Cores — single instanced draw call */}
      <instancedMesh ref={coreRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.65} depthWrite={false} vertexColors />
      </instancedMesh>
      {/* All decorative bonds as a single line-segments draw call */}
      <lineSegments geometry={decorativeBondGeometry}>
        <lineBasicMaterial color="#4B5563" transparent opacity={0.12} />
      </lineSegments>
    </>
  );
}

// ===== Enterprise Atom (prominent, interactive) =====
interface EnterpriseAtomProps {
  enterprise: EnterpriseConfig;
  basePosition: [number, number, number];
  isCurrent: boolean;
  isHovered: boolean;
  hasHover: boolean;
  onSelect: (id: EnterpriseId) => void;
  onHover: (id: EnterpriseId | null) => void;
  theme: Theme;
}

function EnterpriseAtom({
  enterprise, basePosition, isCurrent, isHovered, hasHover,
  onSelect, onHover, theme,
}: EnterpriseAtomProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const color = useMemo(() => new THREE.Color(ENTERPRISE_COLORS[enterprise.id]), [enterprise.id]);
  const vizRadius = 1.5;

  const targetScale = isHovered ? 1.18 : isCurrent ? 1.08 : (hasHover ? 0.85 : 1.0);

  // Only animate scale + emissive intensity (cheap). Position is static.
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const s = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(s + (targetScale - s) * 0.1);

    if (outerRef.current) {
      const mat = outerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isHovered ? 0.85 + Math.sin(t * 3) * 0.15 : isCurrent ? 0.55 : 0.4;
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isHovered ? 1.1 : isCurrent ? 0.75 : 0.55;
    }
  });

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(enterprise.id);
  }, [enterprise.id, onSelect]);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(enterprise.id);
    document.body.style.cursor = 'pointer';
  }, [enterprise.id, onHover]);

  const handlePointerOut = useCallback(() => {
    onHover(null);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const labelOpacity = isHovered ? 1.0 : isCurrent ? 0.95 : 0.85;

  return (
    <group ref={groupRef} position={basePosition}>
      <mesh
        ref={outerRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[vizRadius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.45}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[vizRadius * 0.32, 24, 24]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={1.0}
          emissive={color}
          emissiveIntensity={0.55}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      {isCurrent && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[vizRadius * 1.18, vizRadius * 1.30, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Billboard>
        <Text
          position={[0, -(vizRadius + 0.7), 0]}
          fontSize={0.75}
          color={theme === 'light' ? '#0a1a16' : '#ffffff'}
          anchorX="center"
          anchorY="top"
          fillOpacity={labelOpacity}
        >
          {enterprise.name}
        </Text>
      </Billboard>
    </group>
  );
}

// ===== Nucleus (STRATIS) =====
function Nucleus({ theme }: { theme: Theme }) {
  const outerRef = useRef<THREE.Mesh>(null);
  const color = useMemo(() => new THREE.Color(NUCLEUS_COLOR), []);
  const vizRadius = 2.5;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      const mat = outerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(t * 1.2) * 0.12;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={outerRef}>
        <sphereGeometry args={[vizRadius, 40, 40]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.42}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[vizRadius * 0.35, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={1.0}
          emissive={color}
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <Html
        position={[0, -(vizRadius + 1.2), 0]}
        center
        transform
        sprite
        distanceFactor={6}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <img
          src="/stratis-logo.svg"
          alt="STRATIS"
          width={260}
          height={35}
          draggable={false}
          style={{
            display: 'block',
            filter: theme === 'light' ? 'none' : 'invert(1)',
            opacity: 0.95,
          }}
        />
      </Html>
    </group>
  );
}

// ===== Enterprise bonds — only 3, only highlighted when hovered =====
interface EnterpriseBondsProps {
  hoveredEnterprise: EnterpriseId | null;
  enterprisePositions: Map<EnterpriseId, [number, number, number]>;
}

function EnterpriseBonds({ hoveredEnterprise, enterprisePositions }: EnterpriseBondsProps) {
  return (
    <>
      {ENTERPRISES.map((ent) => {
        const target = enterprisePositions.get(ent.id);
        if (!target) return null;
        const isLit = hoveredEnterprise === ent.id;
        return (
          <Line
            key={`ent-${ent.id}`}
            points={[[0, 0, 0], target]}
            color={ENTERPRISE_COLORS[ent.id]}
            lineWidth={isLit ? 2.6 : 1.2}
            opacity={isLit ? 0.85 : 0.4}
            transparent
          />
        );
      })}
    </>
  );
}

// ===== Ring guides (wireframe spheres) — same as real scene =====
function RingGuides({ theme }: { theme: Theme }) {
  const color = theme === 'light' ? '#0a1a16' : '#ffffff';
  const opacity = theme === 'light' ? 0.08 : 0.06;
  return (
    <>
      {RING_RADII.slice(1).map((radius, i) => (
        <mesh key={i}>
          <sphereGeometry args={[radius, 24, 16]} />
          <meshBasicMaterial
            wireframe
            transparent
            opacity={opacity}
            color={color}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

// ===== Scene Content =====
interface SceneContentProps {
  currentEnterprise: EnterpriseId | null;
  hoveredEnterprise: EnterpriseId | null;
  onSelect: (id: EnterpriseId) => void;
  onHover: (id: EnterpriseId | null) => void;
  theme: Theme;
}

function SceneContent({ currentEnterprise, hoveredEnterprise, onSelect, onHover, theme }: SceneContentProps) {
  // Anchor positions for the 3 enterprise atoms — clean 120° spacing
  const enterprisePositions = useMemo(() => {
    const map = new Map<EnterpriseId, [number, number, number]>();
    for (const ent of ENTERPRISES) {
      map.set(ent.id, enterpriseAnchorPosition(ent.id));
    }
    return map;
  }, []);

  const ambient = theme === 'light' ? 0.85 : 0.6;
  const keyLight = theme === 'light' ? 0.9 : 1.3;
  const fillLight = theme === 'light' ? 0.3 : 0.55;
  const hasHover = hoveredEnterprise !== null;

  return (
    <>
      <ambientLight intensity={ambient} />
      <pointLight position={[25, 30, 25]} intensity={keyLight} />
      <pointLight position={[-20, -15, 20]} intensity={fillLight} color="#5DCAA5" />
      <pointLight position={[0, 0, 0]} intensity={0.5} color={NUCLEUS_COLOR} distance={20} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={80}
        enablePan={false}
      />

      <RingGuides theme={theme} />

      {/* All ~70 decorative atoms + ~250 bonds rendered in 3 batched draw calls */}
      <DecorativeScaffolding />

      <EnterpriseBonds
        hoveredEnterprise={hoveredEnterprise}
        enterprisePositions={enterprisePositions}
      />

      <Nucleus theme={theme} />

      {ENTERPRISES.map((ent) => (
        <EnterpriseAtom
          key={ent.id}
          enterprise={ent}
          basePosition={enterprisePositions.get(ent.id)!}
          isCurrent={currentEnterprise === ent.id}
          isHovered={hoveredEnterprise === ent.id}
          hasHover={hasHover}
          onSelect={onSelect}
          onHover={onHover}
          theme={theme}
        />
      ))}
    </>
  );
}

// ===== Main Component =====
interface EnterpriseMolecularSceneProps {
  currentEnterprise: EnterpriseId | null;
  hoveredId: EnterpriseId | null;
  onSelect: (id: EnterpriseId) => void;
  onHover: (id: EnterpriseId | null) => void;
  theme?: Theme;
}

export function EnterpriseMolecularScene({
  currentEnterprise,
  hoveredId,
  onSelect,
  onHover,
  theme = 'dark',
}: EnterpriseMolecularSceneProps) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 15, 50], fov: 50, near: 0.1, far: 200 }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <SceneContent
          currentEnterprise={currentEnterprise}
          hoveredEnterprise={hoveredId}
          onSelect={onSelect}
          onHover={onHover}
          theme={theme}
        />
      </Canvas>
    </div>
  );
}
