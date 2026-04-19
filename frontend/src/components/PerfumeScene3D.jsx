import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './PerfumeScene3D.css';

/**
 * Full-viewport fixed 3D perfume scene.
 * The bottle is animated via data attributes set by the parent (Home.jsx via GSAP).
 * No internal ScrollTrigger — the parent drives all transforms.
 */
export default function PerfumeScene3D({ sceneRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;

    // ── Renderer (transparent background, no bright planes)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0); // fully transparent
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    el.appendChild(renderer.domElement);

    // ── Scene (NO fog — keep it clean)
    const scene = new THREE.Scene();

    // ── Camera
    const camera = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 5);
    camera.lookAt(0, 0.4, 0);

    // ── Environment map
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(50, 32, 16);
    const envColors = [];
    for (let i = 0; i < envGeo.attributes.position.count; i++) {
      const y = envGeo.attributes.position.getY(i);
      const t = (y / 50 + 1) / 2;
      envColors.push(0.25 * (1 - t) + 0.003, 0.2 * (1 - t) + 0.003, 0.12 * (1 - t) + 0.005);
    }
    envGeo.setAttribute('color', new THREE.Float32BufferAttribute(envColors, 3));
    envScene.add(new THREE.Mesh(envGeo, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
    const envTex = pmrem.fromScene(envScene).texture;
    scene.environment = envTex;
    pmrem.dispose();

    // ── Lights
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.35));

    const keyLight = new THREE.SpotLight(0xfff4e0, 8, 20, Math.PI / 7, 0.4, 1);
    keyLight.position.set(3, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.6);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe8b0, 1.8);
    rimLight.position.set(0, 2, -6);
    scene.add(rimLight);

    const goldPt = new THREE.PointLight(0xd4af37, 6, 7);
    goldPt.position.set(0.8, 1.5, 3);
    scene.add(goldPt);

    // ── NO ground plane — fully transparent background ──

    // ── Gold dust particles
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.012,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    scene.add(dust);

    // ── NO placeholder — load GLB directly, fade in when ready ──
    // Create an invisible group to hold the bottle (for GSAP to target)
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // ── Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/valentino_perfume.glb',
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 2.2 / maxDim;
        model.position.set(-center.x * s, -center.y * s + 0.05, 0);
        model.scale.setScalar(s);

        // Start fully transparent
        model.traverse(c => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
            if (c.material) {
              c.material = c.material.clone();
              c.material.transparent = true;
              c.material.opacity = 0;
            }
          }
        });

        bottleGroup.add(model);

        // ── Hide original text/label meshes from the model ──
        model.traverse(child => {
          if (child.isMesh && child.name) {
            const n = child.name.toLowerCase();
            if (n.includes('text') || n.includes('label') || n.includes('logo') || n.includes('letter')) {
              child.visible = false;
            }
          }
        });

        // ── Add "H PERFUME" brand label ──
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 512;
        labelCanvas.height = 160;
        const lc = labelCanvas.getContext('2d');
        lc.clearRect(0, 0, 512, 160);

        // Gold border
        lc.strokeStyle = 'rgba(212, 175, 55, 0.5)';
        lc.lineWidth = 1.5;
        lc.strokeRect(6, 6, 500, 148);

        // Brand name
        lc.font = '600 52px "Cormorant Garamond", Georgia, serif';
        lc.fillStyle = 'rgba(232, 213, 163, 0.92)';
        lc.textAlign = 'center';
        lc.textBaseline = 'middle';
        lc.fillText('H  PERFUME', 256, 65);

        // Tagline
        lc.font = '300 14px "Inter", sans-serif';
        lc.fillStyle = 'rgba(201, 168, 76, 0.5)';
        lc.letterSpacing = '4px';
        lc.fillText('YOUR  SCENT  ·  YOUR  STORY', 256, 115);

        const labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.needsUpdate = true;

        const labelMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(0.55 * s, 0.17 * s),
          new THREE.MeshBasicMaterial({
            map: labelTex,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        // Position on the front of the bottle body
        labelMesh.position.set(0, -0.15 * s, 0.24 * s);
        model.add(labelMesh);

        // Smooth fade in over 1.2 seconds
        const fadeStart = performance.now();
        const fadeDur = 1200;
        const fadeIn = () => {
          const elapsed = performance.now() - fadeStart;
          const t = Math.min(elapsed / fadeDur, 1);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          model.traverse(c => {
            if (c.isMesh && c.material) {
              c.material.opacity = eased;
            }
          });
          if (t < 1) requestAnimationFrame(fadeIn);
          else {
            // After fade complete, disable transparency for better rendering
            model.traverse(c => {
              if (c.isMesh && c.material) {
                c.material.transparent = false;
                c.material.opacity = 1;
              }
            });
          }
        };
        requestAnimationFrame(fadeIn);

        // Expose to parent
        if (sceneRef) sceneRef.current.bottle = bottleGroup;
      },
      undefined,
      () => {
        // GLB failed — show a minimal placeholder instead
        const ph = buildPlaceholder(THREE);
        bottleGroup.add(ph);
        if (sceneRef) sceneRef.current.bottle = bottleGroup;
      }
    );

    // ── Expose refs to parent for GSAP scroll control
    if (sceneRef) {
      sceneRef.current = {
        bottle: bottleGroup,
        camera,
        goldPt,
        keyLight,
        dust,
        scene,
      };
    }

    // ── Render loop
    let rafId;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle float
      if (bottleGroup.children.length > 0) {
        bottleGroup.position.y += Math.sin(t * 0.5) * 0.0008;
      }

      // Dust rotation
      dust.rotation.y += 0.0003;
      dust.rotation.x += 0.0001;

      // Gold light pulse
      goldPt.intensity = 6 + Math.sin(t * 0.6) * 0.8;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [sceneRef]);

  return <div ref={mountRef} className="perfume-scene-3d" />;
}

// ─── Placeholder bottle ────────────────
function buildPlaceholder(THREE) {
  const group = new THREE.Group();

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xfaf5e0, metalness: 0, roughness: 0.0,
    transmission: 1, thickness: 1.5, ior: 1.52,
    transparent: true, opacity: 0.90, envMapIntensity: 5,
  });

  const gold = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 1, roughness: 0.04, envMapIntensity: 7,
  });

  const liquid = new THREE.MeshPhysicalMaterial({
    color: 0xc8952a, transmission: 0.45, transparent: true, opacity: 0.55,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.65, 0.44), glass);
  group.add(body);

  const liq = new THREE.Mesh(new THREE.BoxGeometry(0.73, 1.2, 0.32), liquid);
  liq.position.y = -0.2;
  group.add(liq);

  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.43, 0.32, 64), glass);
  sh.position.y = 0.98;
  group.add(sh);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.20, 0.60, 64), glass);
  neck.position.y = 1.44;
  group.add(neck);

  [1.32, 1.62].forEach((y, i) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.155 - i * 0.01, 0.016, 16, 128), gold);
    r.position.y = y; r.rotation.x = Math.PI / 2;
    group.add(r);
  });

  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.16, 0.30), gold);
  cap.position.y = 1.93;
  group.add(cap);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.42, 32), gold);
  stem.position.y = 1.70;
  group.add(stem);

  const base = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 16, 128), gold);
  base.position.y = -0.82; base.rotation.x = Math.PI / 2;
  group.add(base);

  const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.04, 64), gold);
  bot.position.y = -0.84;
  group.add(bot);

  return group;
}
