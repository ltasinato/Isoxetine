// ============================================================
// galerie-commun.js
// Code partagé entre les différentes salles
// ============================================================

const GalerieCommun = {

  // === TEXTURES PROCÉDURALES ===

  makeBrickTexture(baseColor = '#3a2820', mortarDark = 0.15) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    const bw = 64, bh = 24;
    for (let y = 0; y < 512; y += bh) {
      const offset = (Math.floor(y / bh) % 2) * (bw / 2);
      for (let x = -bw; x < 512; x += bw) {
        const r = 90 + Math.random() * 40;
        const g = 50 + Math.random() * 25;
        const b = 35 + Math.random() * 20;
        ctx.fillStyle = `rgb(${r|0},${g|0},${b|0})`;
        ctx.fillRect(x + offset + 1, y + 1, bw - 2, bh - 2);
        ctx.fillStyle = `rgba(0,0,0,${mortarDark})`;
        ctx.fillRect(x + offset, y, 1, bh);
        ctx.fillRect(x + offset, y, bw, 1);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  makeGrassTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#2d4a1f';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
      const r = 30 + Math.random() * 60;
      const g = 60 + Math.random() * 70;
      const b = 20 + Math.random() * 30;
      ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${0.3 + Math.random()*0.5})`;
      ctx.fillRect(Math.random()*512, Math.random()*512, 1+Math.random()*3, 1+Math.random()*3);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  makeStonePathTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#7a7268';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
      const v = 100 + Math.random() * 60;
      ctx.fillStyle = `rgba(${v|0},${(v-10)|0},${(v-20)|0},${Math.random()*0.6})`;
      ctx.fillRect(Math.random()*512, Math.random()*512, 1+Math.random()*2, 1+Math.random()*2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  makeWoodTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#5a3f24';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 100; i++) {
      const y = Math.random() * 512;
      const v = 50 + Math.random() * 60;
      ctx.fillStyle = `rgba(${v|0},${(v-20)|0},${(v-30)|0},${0.3 + Math.random()*0.4})`;
      ctx.fillRect(0, y, 512, 1 + Math.random() * 3);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  makePlaceholderTexture(idx, message = 'Photo manquante') {
    const palettes = [
      ['#d4654a', '#f4a261', '#e9c46a', '#264653'],
      ['#2a9d8f', '#264653', '#e76f51', '#f4a261'],
      ['#6a994e', '#a7c957', '#f2e8cf', '#bc4749'],
      ['#003049', '#d62828', '#f77f00', '#fcbf49'],
      ['#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'],
      ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
      ['#1d3557', '#457b9d', '#a8dadc', '#f1faee'],
      ['#5f0f40', '#9a031e', '#fb8b24', '#e36414'],
    ];
    const p = palettes[idx % palettes.length];
    const c = document.createElement('canvas');
    c.width = 400; c.height = 500;
    const ctx = c.getContext('2d');
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, 400, 500);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = p[(i+1) % p.length];
      ctx.globalAlpha = 0.7 + Math.random()*0.3;
      ctx.beginPath();
      ctx.arc(Math.random()*400, Math.random()*500, 50 + Math.random()*120, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Photo ' + (idx+1), 200, 250);
    ctx.font = '16px sans-serif';
    ctx.fillText(message, 200, 280);
    return new THREE.CanvasTexture(c);
  },

  loadPhotoMaterial(src, idx, options = {}) {
    const loader = new THREE.TextureLoader();
    const placeholder = this.makePlaceholderTexture(idx);
    const mat = new THREE.MeshStandardMaterial({
      map: placeholder,
      roughness: options.roughness ?? 0.4,
      emissive: options.emissive ?? 0x222222,
      emissiveIntensity: options.emissiveIntensity ?? 0.15
    });
    if (src) {
      loader.load(
        src,
        (tex) => { mat.map = tex; mat.needsUpdate = true; },
        undefined,
        () => { /* on garde le placeholder */ }
      );
    }
    return mat;
  },

  // === CONTRÔLES FPS ===
  setupFPSControls(camera, renderer, options = {}) {
    const state = {
      keys: {},
      pitch: 0,
      yaw: options.initialYaw ?? 0,
      pointerLocked: false,
    };

    const canvas = renderer.domElement;

    canvas.addEventListener('click', () => {
      canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
      canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      state.pointerLocked = document.pointerLockElement === canvas;
      if (options.onLockChange) options.onLockChange(state.pointerLocked);
    });

    document.addEventListener('mousemove', (e) => {
      if (!state.pointerLocked) return;
      state.yaw -= e.movementX * 0.002;
      state.pitch -= e.movementY * 0.002;
      state.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, state.pitch));
    });

    window.addEventListener('keydown', (e) => { state.keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { state.keys[e.code] = false; });

    return state;
  },

  applyMovement(camera, state, dt, speed = 4) {
    const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
    const move = new THREE.Vector3();

    if (state.keys['KeyW'] || state.keys['KeyZ'] || state.keys['ArrowUp']) move.add(forward);
    if (state.keys['KeyS'] || state.keys['ArrowDown']) move.sub(forward);
    if (state.keys['KeyA'] || state.keys['KeyQ'] || state.keys['ArrowLeft']) move.sub(right);
    if (state.keys['KeyD'] || state.keys['ArrowRight']) move.add(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * dt);
      camera.position.add(move);
    }

    camera.rotation.order = 'YXZ';
    camera.rotation.y = state.yaw;
    camera.rotation.x = state.pitch;

    return move;
  },

  // === RAYCASTING POUR LES TITRES DE PHOTOS ===
  setupHoverDetection(camera, photoMeshes, titleOverlay) {
    const raycaster = new THREE.Raycaster();
    const center = new THREE.Vector2(0, 0);

    return function checkHover() {
      raycaster.setFromCamera(center, camera);
      const hits = raycaster.intersectObjects(photoMeshes);
      if (hits.length > 0 && hits[0].distance < 4) {
        titleOverlay.textContent = hits[0].object.userData.titre || '';
        titleOverlay.style.opacity = '1';
      } else {
        titleOverlay.style.opacity = '0';
      }
    };
  },
};
