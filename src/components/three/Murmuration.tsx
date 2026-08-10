"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { FORM_KEYS, buildFormations } from "./formations";

const N = 2290;
const EMBER_STRIDE = 12; // every 12th agent burns — spread through every formation
const N_EMBERS = Math.ceil(N / EMBER_STRIDE);
const N_BODIES = N - N_EMBERS;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Per-formation flock opacity — the ledger grid ghosts back so content leads. */
const FORM_OPACITY = [1, 1, 1, 0.85, 0.32, 1];

/** Resolve scroll progress → (formA, formB, blend 0..1). */
function segmentAt(p: number): { a: number; b: number; t: number } {
  for (let i = 0; i < FORM_KEYS.length - 1; i++) {
    const k0 = FORM_KEYS[i];
    const k1 = FORM_KEYS[i + 1];
    if (p >= k0.p && p <= k1.p) {
      const span = k1.p - k0.p || 1;
      return { a: k0.f, b: k1.f, t: (p - k0.p) / span };
    }
  }
  const last = FORM_KEYS[FORM_KEYS.length - 1];
  return { a: last.f, b: last.f, t: 0 };
}

export function Murmuration({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const bodiesRef = useRef<THREE.InstancedMesh>(null);
  const embersRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const { forms, hash, phase, positions, colors, slotOf, isEmber } = useMemo(() => {
    const set = buildFormations(N);
    const positions = new Float32Array(set.forms[0]);
    const colors = new Float32Array(N_BODIES * 3);
    const slotOf = new Int32Array(N);
    const isEmber = new Uint8Array(N);
    let b = 0;
    let e = 0;
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      if (i % EMBER_STRIDE === 0) {
        isEmber[i] = 1;
        slotOf[i] = e++;
      } else {
        slotOf[i] = b;
        // parchment with subtle warm variance
        const l = 0.62 + set.hash[i] * 0.38;
        c.setRGB(0.93 * l, 0.9 * l, 0.855 * l);
        colors[b * 3] = c.r;
        colors[b * 3 + 1] = c.g;
        colors[b * 3 + 2] = c.b;
        b++;
      }
    }
    return {
      forms: set.forms,
      hash: set.hash,
      phase: set.phase,
      positions,
      colors,
      slotOf,
      isEmber,
    };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const vTarget = useMemo(() => new THREE.Vector3(), []);
  const vLook = useMemo(() => new THREE.Vector3(), []);

  const geoBody = useMemo(() => {
    const g = new THREE.ConeGeometry(0.052, 0.34, 4);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const geoEmber = useMemo(() => {
    const g = new THREE.ConeGeometry(0.065, 0.42, 4);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  useFrame((state, dt) => {
    const bodies = bodiesRef.current;
    const embers = embersRef.current;
    const group = groupRef.current;
    if (!bodies || !embers || !group) return;

    const time = state.clock.elapsedTime;
    const p = Math.min(1, Math.max(0, progressRef.current));
    const { a, b, t } = segmentAt(p);
    const formA = forms[a];
    const formB = forms[b];
    const morphing = a !== b;

    // scroll-aware opacity
    const op = FORM_OPACITY[a] + (FORM_OPACITY[b] - FORM_OPACITY[a]) * smoothstep(t);
    (bodies.material as THREE.MeshBasicMaterial).opacity = op;
    (embers.material as THREE.MeshBasicMaterial).opacity = 0.92 * op;

    // pointer parallax + hero breathing
    group.rotation.y += (pointer.x * 0.13 - group.rotation.y) * 0.045;
    group.rotation.x += (-pointer.y * 0.09 - group.rotation.x) * 0.045;
    group.rotation.z = p < 0.06 ? Math.sin(time * 0.5) * 0.028 : group.rotation.z * 0.96;

    const damp = Math.min(1, dt * 3.4);
    const S = 0.42; // stagger width — transitions ripple through the flock

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let tx: number;
      let ty: number;
      let tz: number;
      if (morphing) {
        const local = smoothstep(
          Math.min(1, Math.max(0, (t * (1 + S) - hash[i] * S))),
        );
        tx = formA[i3] + (formB[i3] - formA[i3]) * local;
        ty = formA[i3 + 1] + (formB[i3 + 1] - formA[i3 + 1]) * local;
        tz = formA[i3 + 2] + (formB[i3 + 2] - formA[i3 + 2]) * local;
      } else {
        tx = formA[i3];
        ty = formA[i3 + 1];
        tz = formA[i3 + 2];
      }
      // flock shimmer — small per-instance orbit around the slot
      const ph = phase[i];
      tx += Math.sin(time * 0.7 + ph) * 0.085;
      ty += Math.cos(time * 0.6 + ph * 1.3) * 0.075;
      tz += Math.sin(time * 0.5 + ph * 0.7) * 0.06;

      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];
      const nx = px + (tx - px) * damp;
      const ny = py + (ty - py) * damp;
      const nz = pz + (tz - pz) * damp;
      positions[i3] = nx;
      positions[i3 + 1] = ny;
      positions[i3 + 2] = nz;

      // orient along velocity (fallback: keep facing +Z drift)
      const vx = nx - px;
      const vy = ny - py;
      const vz = nz - pz;
      dummy.position.set(nx, ny, nz);
      const speed2 = vx * vx + vy * vy + vz * vz;
      if (speed2 > 1e-8) {
        vLook.set(nx + vx, ny + vy, nz + vz);
        dummy.lookAt(vLook);
      } else {
        vTarget.set(nx + 0.001, ny, nz + 1);
        dummy.lookAt(vTarget);
      }
      const ember = isEmber[i] === 1;
      const sc = ember ? 1.0 + hash[i] * 0.4 : 0.85 + hash[i] * 0.5;
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      if (ember) {
        embers.setMatrixAt(slotOf[i], dummy.matrix);
      } else {
        bodies.setMatrixAt(slotOf[i], dummy.matrix);
      }
    }
    bodies.instanceMatrix.needsUpdate = true;
    embers.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={bodiesRef}
        args={[geoBody, undefined, N_BODIES]}
        frustumCulled={false}
      >
        <meshBasicMaterial color="#ffffff" fog={true} toneMapped={false} transparent opacity={1} />
        <instancedBufferAttribute
          attach="instanceColor"
          args={[colors, 3]}
        />
      </instancedMesh>
      <instancedMesh
        ref={embersRef}
        args={[geoEmber, undefined, N_EMBERS]}
        frustumCulled={false}
      >
        <meshBasicMaterial
          color="#FF4A1F"
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
