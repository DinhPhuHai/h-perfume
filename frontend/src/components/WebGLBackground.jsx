import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './WebGLBackground.css';

export default function WebGLBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Gold particle material
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    // Gold color palette
    const goldPalette = [
      new THREE.Color('#d4af37'),
      new THREE.Color('#f5d67a'),
      new THREE.Color('#c9a84c'),
      new THREE.Color('#b8860b'),
      new THREE.Color('#ffe4a0'),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1]  = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2]  = (Math.random() - 0.5) * 40;
      sizes[i] = Math.random() * 2.5 + 0.3;
      const c = goldPalette[Math.floor(Math.random() * goldPalette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader material for particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(pos.x * 0.3 + uTime * 0.4) * 0.6;
          pos.x += cos(pos.y * 0.3 + uTime * 0.3) * 0.4;
          vAlpha = 0.5 + 0.5 * sin(uTime * 0.8 + pos.x * 0.1 + pos.y * 0.1);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (280.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * vAlpha;
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Connection lines between close particles
    const linePositions = new Float32Array(particleCount * particleCount * 3);
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Scroll tracking
    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize handler
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };
    window.addEventListener('resize', onResize);

    let animId;
    let lastTime = 0;
    const maxConnections = 1200;
    let lineIndex = 0;

    const animate = (time) => {
      animId = requestAnimationFrame(animate);
      const delta = time - lastTime;
      if (delta < 32) return; // cap ~30fps for particle updates
      lastTime = time;

      material.uniforms.uTime.value = time * 0.001;

      // Smooth camera movement following mouse
      camera.position.x += (mouse.x * 4 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 3 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Parallax on scroll
      scene.position.y = scrollY * 0.005;

      // Update connection lines
      const posAttr = geometry.getAttribute('position');
      const lp = lineGeometry.getAttribute('position').array;
      lineIndex = 0;
      const threshold = 6;

      for (let i = 0; i < particleCount && lineIndex < maxConnections * 6; i++) {
        for (let j = i + 1; j < particleCount && lineIndex < maxConnections * 6; j++) {
          const dx = posAttr.array[i * 3] - posAttr.array[j * 3];
          const dy = posAttr.array[i * 3 + 1] - posAttr.array[j * 3 + 1];
          const dz = posAttr.array[i * 3 + 2] - posAttr.array[j * 3 + 2];
          const dist2 = dx * dx + dy * dy + dz * dz;
          if (dist2 < threshold * threshold) {
            lp[lineIndex++] = posAttr.array[i * 3];
            lp[lineIndex++] = posAttr.array[i * 3 + 1];
            lp[lineIndex++] = posAttr.array[i * 3 + 2];
            lp[lineIndex++] = posAttr.array[j * 3];
            lp[lineIndex++] = posAttr.array[j * 3 + 1];
            lp[lineIndex++] = posAttr.array[j * 3 + 2];
          }
        }
      }

      lineGeometry.getAttribute('position').needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIndex / 3);

      renderer.render(scene, camera);
    };

    animate(0);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={mountRef} className="webgl-bg" />;
}
