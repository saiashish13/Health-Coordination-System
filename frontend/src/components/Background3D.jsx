import { useEffect, useRef } from "react";
import "../styles/Background3D.css";

/**
 * Background3D Component
 * 
 * Provides a fixed, full-screen decorative 3D layered background:
 * - 4 distinct depth layers (far to near) using translateZ and perspective
 * - Volumetric 3D CSS shapes (spheres, glowing toruses, rounded cubes, pills)
 * - Tilted perspective grid floor
 * - 60fps mouse parallax using requestAnimationFrame and smooth lerping
 * - Graceful auto-drift fallback for touch / idle states
 * - Fully controlled by theme CSS variables (--shape-*, --glow)
 */
export default function Background3D() {
  const layer1Ref = useRef(null); // Far
  const layer2Ref = useRef(null); // Mid-far
  const layer3Ref = useRef(null); // Mid
  const layer4Ref = useRef(null); // Near
  const floorRef = useRef(null);  // Perspective floor

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;
    let lastMoveTime = 0;
    let animationFrameId;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = ((e.clientX / innerWidth) - 0.5) * 2;
      targetY = ((e.clientY / innerHeight) - 0.5) * 2;
      isMoving = true;
      lastMoveTime = performance.now();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const startTime = performance.now();

    const animate = (time) => {
      // Subtle auto-drift when idle for > 2.5s or on touch devices
      if (!isMoving || time - lastMoveTime > 2500) {
        const elapsed = (time - startTime) * 0.0006;
        targetX = Math.sin(elapsed) * 0.45;
        targetY = Math.cos(elapsed * 0.75) * 0.35;
      }

      // Smooth lerp (linear interpolation) for 60fps butteriness
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      // Layer 1 (Far): smallest parallax offset, deepest translateZ
      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate3d(${currentX * 6}px, ${currentY * 6}px, -240px)`;
      }

      // Layer 2 (Mid-far)
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate3d(${currentX * 11}px, ${currentY * 11}px, -120px)`;
      }

      // Layer 3 (Mid)
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate3d(${currentX * 16}px, ${currentY * 16}px, 0px)`;
      }

      // Layer 4 (Near): largest parallax offset (nearer layers move more, max ~20-22px)
      if (layer4Ref.current) {
        layer4Ref.current.style.transform = `translate3d(${currentX * 22}px, ${currentY * 22}px, 90px)`;
      }

      // Perspective floor: tilt response
      if (floorRef.current) {
        floorRef.current.style.transform = `rotateX(62deg) translate3d(${currentX * 14}px, ${currentY * 10}px, -60px)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="bg-3d-scene-container" aria-hidden="true">
      {/* Perspective Grid Floor */}
      <div ref={floorRef} className="bg-perspective-floor" />

      {/* Layer 1: Far Depth Layer */}
      <div ref={layer1Ref} className="depth-layer layer-far">
        <div className="shape-3d shape-sphere-1 far-orb-1" />
        <div className="shape-3d shape-torus-1 far-torus-1" />
      </div>

      {/* Layer 2: Mid-Far Depth Layer */}
      <div ref={layer2Ref} className="depth-layer layer-mid-far">
        <div className="shape-3d shape-sphere-2 midfar-sphere-1" />
        <div className="shape-3d shape-cube-1 midfar-cube-1" />
      </div>

      {/* Layer 3: Mid Depth Layer */}
      <div ref={layer3Ref} className="depth-layer layer-mid">
        <div className="shape-3d shape-torus-1 mid-torus-1" />
        <div className="shape-3d shape-pill-1 mid-pill-1" />
      </div>

      {/* Layer 4: Near Depth Layer */}
      <div ref={layer4Ref} className="depth-layer layer-near">
        <div className="shape-3d shape-sphere-3 near-sphere-1" />
        <div className="shape-3d shape-torus-1 near-torus-1" />
      </div>
    </div>
  );
}
