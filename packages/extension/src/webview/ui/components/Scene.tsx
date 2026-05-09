import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { MeshPayload } from "../../../types";

interface SceneProps {
  meshPayload: MeshPayload | null;
  wireframe: boolean;
  showGrid: boolean;
  scale: number;
}

export const Scene: React.FC<SceneProps> = ({
  meshPayload,
  wireframe,
  showGrid,
  scale,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const frameRef = useRef<number>(0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const spherical = useRef(new THREE.Spherical(5, Math.PI / 4, Math.PI / 4));

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x1e1e1e);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 1000);
    camera.position.setFromSpherical(spherical.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(ambientLight, dirLight);

    const grid = new THREE.GridHelper(10, 20, 0x444444, 0x333333);
    gridRef.current = grid;
    scene.add(grid);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current) {
        return;
      }
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) {
        return;
      }
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      spherical.current.theta -= dx * 0.01;
      spherical.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, spherical.current.phi + dy * 0.01),
      );
      camera.position.setFromSpherical(spherical.current);
      camera.lookAt(0, 0, 0);
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      spherical.current.radius = Math.max(
        1,
        spherical.current.radius + e.deltaY * 0.01,
      );
      camera.position.setFromSpherical(spherical.current);
      camera.lookAt(0, 0, 0);
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        (meshRef.current.material as THREE.Material).dispose();
      }
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update mesh scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
    }
  }, [scale]);

  // Update mesh when payload changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }

    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }

    if (
      !meshPayload ||
      meshPayload.vertices.length === 0 ||
      meshPayload.vertices.length % 3 !== 0
    ) {
      return;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(meshPayload.vertices, 3),
    );
    if (meshPayload.normals.length > 0) {
      geo.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(meshPayload.normals, 3),
      );
    }
    if (meshPayload.indices.length > 0) {
      geo.setIndex(meshPayload.indices);
    }
    if (!meshPayload.normals.length) {
      geo.computeVertexNormals();
    }

    const mat = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(scale, scale, scale);
    meshRef.current = mesh;
    scene.add(mesh);
  }, [meshPayload, scale]);

  // Toggle wireframe on existing mesh without reloading geometry
  useEffect(() => {
    if (meshRef.current && meshPayload) {
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.wireframe = wireframe;
      }
    }
  }, [wireframe, meshPayload]);

  // Toggle grid
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = showGrid;
    }
  }, [showGrid]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};
