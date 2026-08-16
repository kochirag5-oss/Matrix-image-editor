'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HolographicObjectProps {
  scrollProgress?: number;
  className?: string;
}

export default function HolographicObject3D({ className = '' }: HolographicObjectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Holographic Geometry: Icosahedron with Wireframe & Glowing Points
    const geometry = new THREE.IcosahedronGeometry(1.6, 2);
    
    // Wireframe Mesh
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x7B5CFF,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(geometry, wireMaterial);
    scene.add(wireMesh);

    // Inner glowing core
    const innerGeometry = new THREE.IcosahedronGeometry(1.1, 1);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);

    // Vertices Points
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x39FFB0,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    // Mouse Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.5;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Ambient auto-rotation
      wireMesh.rotation.y = elapsedTime * 0.15 + targetRotationY;
      wireMesh.rotation.x = elapsedTime * 0.1 + targetRotationX;

      innerMesh.rotation.y = -elapsedTime * 0.2 + targetRotationY;
      innerMesh.rotation.z = elapsedTime * 0.15;

      points.rotation.y = wireMesh.rotation.y;
      points.rotation.x = wireMesh.rotation.x;

      // Subtle breathing scale
      const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      wireMesh.scale.set(scale, scale, scale);
      points.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      innerGeometry.dispose();
      wireMaterial.dispose();
      innerMaterial.dispose();
      pointsMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
}
