// MANSION VISION — The Modern Hillside Palace · interactive 3D
// A slow, cinematic tour of Example 02 rendered in real time.
import * as THREE from 'three';
import {
  grassTexture, roofGrassTexture, cliffTexture, barkTexture, asphaltTexture,
  travertineTexture, interiorTexture, glowTexture, bottleShelfTexture,
} from './textures.js';

/* ---------------------------------------------------------- setup */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x141c2e, 150, 720);

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(46, 8, 34);

/* ---------------------------------------------------------- lights */
scene.add(new THREE.HemisphereLight(0x93b6dd, 0x201510, 0.75));

const sunAfterglow = new THREE.DirectionalLight(0xff9a4e, 1.35);
sunAfterglow.position.set(-140, 26, -45);   // low in the west
sunAfterglow.castShadow = true;
sunAfterglow.shadow.mapSize.set(2048, 2048);
sunAfterglow.shadow.camera.left = -70; sunAfterglow.shadow.camera.right = 70;
sunAfterglow.shadow.camera.top = 70;  sunAfterglow.shadow.camera.bottom = -70;
sunAfterglow.shadow.camera.far = 400;
sunAfterglow.shadow.bias = -0.0006;
sunAfterglow.shadow.normalBias = 0.03;
scene.add(sunAfterglow);

const eastFill = new THREE.DirectionalLight(0x7e97bd, 0.5);
eastFill.position.set(120, 60, 80);
scene.add(eastFill);

/* ---------------------------------------------------------- sky dome + stars */
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(1500, 32, 18),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 vDir;
      void main() {
        float up = clamp(vDir.y, -0.08, 1.0);
        vec3 zenith  = vec3(0.022, 0.034, 0.098);
        vec3 mid     = vec3(0.075, 0.115, 0.235);
        vec3 horizon = vec3(0.16, 0.21, 0.38);
        vec3 col = mix(horizon, mid, smoothstep(0.0, 0.16, up));
        col = mix(col, zenith, smoothstep(0.14, 0.62, up));
        // ember afterglow toward the west horizon
        float west = clamp(dot(normalize(vec3(vDir.x, 0.0, vDir.z)), vec3(-1.0, 0.0, 0.0)), 0.0, 1.0);
        float lowBand = pow(1.0 - clamp(abs(vDir.y) * 3.4, 0.0, 1.0), 3.0);
        col += vec3(1.0, 0.42, 0.13) * pow(west, 5.5) * lowBand * 1.25;
        col += vec3(1.0, 0.72, 0.35) * pow(west, 14.0) * pow(1.0 - clamp(vDir.y * 6.0, 0.0, 1.0), 4.0);
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
);
scene.add(sky);

{
  const starCount = 1100;
  const pos = new Float32Array(starCount * 3);
  const col = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    // random direction, upper hemisphere, biased away from the ember west
    const theta = Math.random() * Math.PI * 2;
    const y = 0.18 + Math.random() * 0.82;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    pos[i * 3] = Math.cos(theta) * r * 1400;
    pos[i * 3 + 1] = y * 1400;
    pos[i * 3 + 2] = Math.sin(theta) * r * 1400;
    const b = 0.35 + Math.random() * 0.65;
    col[i * 3] = b; col[i * 3 + 1] = b; col[i * 3 + 2] = b * (0.85 + Math.random() * 0.15);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2.1, vertexColors: true, sizeAttenuation: false, transparent: true, opacity: 0.95, fog: false })));
}

// low sun afterglow + horizon ember sprites
const glowTex = glowTexture('rgba(255,190,110,1)', 'rgba(255,140,60,0)');
function addGlow(x, y, z, scale, color, opacity = 0.9) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  s.position.set(x, y, z); s.scale.set(scale, scale, 1);
  scene.add(s); return s;
}
addGlow(-1250, 30, -180, 700, 0xff8a3a, 0.85);   // sunken sun
addGlow(-1250, 6, 60, 420, 0xffb060, 0.6);

/* ---------------------------------------------------------- materials */
const whiteConcrete = new THREE.MeshStandardMaterial({ color: 0xf2ede3, roughness: 0.58, metalness: 0.05 });
const whiteConcreteEdge = new THREE.MeshStandardMaterial({ color: 0xd9d3c6, roughness: 0.75, metalness: 0.04 });
const blackMarble = new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.16, metalness: 0.35 });
const bronzeDark = new THREE.MeshStandardMaterial({ color: 0x35291d, roughness: 0.3, metalness: 0.9 });
const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x24401e, roughness: 0.9 });
const topiaryMat = new THREE.MeshStandardMaterial({ color: 0x2c4a24, roughness: 0.92 });

const grassTex = grassTexture();
const plateauTop = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1.0, color: 0x9fb184 });
const cliffMat = new THREE.MeshStandardMaterial({ map: cliffTexture(), roughness: 0.96, color: 0xb9a89a });
const asphaltMat = new THREE.MeshStandardMaterial({ map: asphaltTexture(), roughness: 0.94 });
const travertineMat = new THREE.MeshStandardMaterial({ map: travertineTexture(), roughness: 0.62, color: 0xe8e0d0 });
const roofGrassMat = new THREE.MeshStandardMaterial({ map: roofGrassTexture(), roughness: 0.95, color: 0xa8b57c });
const barkMat = new THREE.MeshStandardMaterial({ map: barkTexture(), roughness: 0.95 });

/* ---------------------------------------------------------- terrain: bluff plateau + ocean */
{
  const plateau = new THREE.Mesh(
    new THREE.CylinderGeometry(56, 66, 26, 72, 1, false),
    [cliffMat, plateauTop, cliffMat]
  );
  plateau.position.set(0, -13.0, 0);
  plateau.receiveShadow = true;
  scene.add(plateau);
}

// distant rolling hill silhouettes (east + flanks)
{
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x1c2b33, roughness: 1 });
  const hills = [
    [150, -30, 300, 95, 34], [240, -32, -140, 120, 42], [90, -30, -280, 80, 26],
    [-60, -32, 330, 90, 30], [-80, -34, -330, 100, 34], [320, -34, 60, 130, 46],
  ];
  for (const [x, y, z, sx, sy] of hills) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), hillMat);
    h.scale.set(sx, sy, sx * 0.8);
    h.position.set(x, y, z);
    scene.add(h);
  }
}

// ocean with animated dusk shader + ember glitter path toward the sunset
const oceanUniforms = { uTime: { value: 0 } };
{
  const oceanMat = new THREE.ShaderMaterial({
    uniforms: oceanUniforms,
    fog: false,
    vertexShader: `
      varying vec2 vUv; varying vec3 vWorld;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform float uTime; varying vec2 vUv; varying vec3 vWorld;
      void main() {
        float shore = smoothstep(0.0, 0.16, vUv.x);          // vUv.x: 0 = far horizon, 1 = shoreline
        vec3 deep = vec3(0.008, 0.055, 0.115);
        vec3 mid  = vec3(0.016, 0.115, 0.21);
        vec3 col = mix(deep, mid, shore * 0.85);
        // ember glitter lane toward the sunset (west, -x)
        float lane = exp(-abs(vWorld.z + 130.0) / 90.0);
        float glint = pow(max(0.0, sin(vWorld.z * 0.55 + uTime * 0.7) * 0.5 + 0.5), 9.0)
                    * pow(max(0.0, sin(vWorld.z * 0.13 - uTime * 0.35 + vWorld.x * 0.02) * 0.5 + 0.5), 5.0);
        col += vec3(1.0, 0.5, 0.18) * lane * glint * 1.6;
        // rolling swell shading
        float swell = sin(vWorld.x * 0.045 + uTime * 0.55) + sin(vWorld.z * 0.032 - uTime * 0.42);
        col += vec3(0.02, 0.05, 0.08) * (swell * 0.5 + 0.5) * 0.6;
        // foam flecks near the shore
        float foam = pow(max(0.0, sin(vWorld.z * 0.9 + uTime * 0.8) * sin(vWorld.x * 0.5 - uTime * 0.6)), 16.0) * smoothstep(0.86, 1.0, vUv.x);
        col += vec3(0.75, 0.82, 0.85) * foam * 0.8;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2400, 1600, 1, 1), oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(-1150, -22, 0);   // west of the bluff
  scene.add(ocean);
}

/* ---------------------------------------------------------- helpers */
function crescentShape(R, r, a0, a1) {
  const s = new THREE.Shape();
  s.absarc(0, 0, R, a0, a1, false);
  if (r > 0.01) s.absarc(0, 0, r, a1, a0, true);
  else s.lineTo(0, 0);
  s.closePath();
  return s;
}
function arcRing(R, r, a0, a1, height, mat, curveSegments = 64) {
  const geo = new THREE.ExtrudeGeometry(crescentShape(R, r, a0, a1), { depth: height, bevelEnabled: false, curveSegments });
  geo.rotateX(-Math.PI / 2);   // extrusion -> +Y
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
const A_C = Math.PI;         // west, facing the ocean
const A_HALF = 1.14;         // half-angle of the crescent opening
const A0 = A_C - A_HALF, A1 = A_C + A_HALF;
const END_X = Math.cos(A_C - A_HALF);   // chord x = cos(π−half) (≈ -0.42)
const CHORD = Math.sin(A_HALF);         // chord half-width factor (z extent)

/* ---------------------------------------------------------- the mansion */
const house = new THREE.Group();
scene.add(house);

const LEVELS = [
  { R: 23.0, r: 19.5, y: 0.00, glassH: 3.6 },
  { R: 22.0, r: 18.6, y: 4.15, glassH: 3.5 },
  { R: 20.8, r: 17.4, y: 8.25, glassH: 3.2 },
];
const SLAB_T = 0.62;

const interiorTex = interiorTexture();
const interiorMat = new THREE.MeshBasicMaterial({ map: interiorTex, fog: true });

for (const L of LEVELS) {
  // crescent floor/roof slab
  const slab = arcRing(L.R + 0.55, 0, A0, A1, SLAB_T, whiteConcrete, 96);
  slab.position.y = L.y;
  house.add(slab);
  // curved glass curtain wall
  const glassR = L.R - 0.45;
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(glassR, glassR, L.glassH, 64, 1, true, Math.PI * 1.5 - A_HALF, A_HALF * 2),
    new THREE.MeshPhysicalMaterial({ color: 0x33465c, roughness: 0.05, metalness: 0.92, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false })
  );
  glass.position.y = L.y + SLAB_T + L.glassH / 2;
  house.add(glass);
  // warm interior glow wall just behind the glass
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(glassR - 0.35, glassR - 0.35, L.glassH, 48, 1, true, Math.PI * 1.5 - A_HALF, A_HALF * 2),
    interiorMat
  );
  inner.position.y = L.y + SLAB_T + L.glassH / 2;
  house.add(inner);
  // slim bronze mullions
  const mullionCount = 26;
  for (let i = 0; i <= mullionCount; i++) {
    const th = Math.PI * 1.5 - A_HALF + (A_HALF * 2 * i) / mullionCount;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, L.glassH, 0.09), bronzeDark);
    m.position.set(Math.cos(th) * (glassR + 0.02), L.y + SLAB_T + L.glassH / 2, Math.sin(th) * (glassR + 0.02));
    house.add(m);
  }
  // cove light strip along the slab edge (emissive arc)
  const cove = new THREE.Mesh(
    new THREE.CylinderGeometry(L.R + 0.31, L.R + 0.31, 0.09, 72, 1, true, Math.PI * 1.5 - A_HALF, A_HALF * 2),
    new THREE.MeshBasicMaterial({ color: 0xffc98a, side: THREE.DoubleSide, fog: true })
  );
  cove.position.y = L.y + SLAB_T - 0.045;
  house.add(cove);
}

// flat east (chord) service wall with pivot door + slot windows
{
  const wallH = 8.25 + 3.2 + SLAB_T;   // full height to roof
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.7, wallH, 2 * 19.0 * CHORD), whiteConcrete);
  // chord plane sits at x = cos(A0) * R of the smallest level for a clean back line
  const backX = Math.cos(A0) * 20.8;
  wall.position.set(backX, wallH / 2, 0);
  wall.castShadow = true; wall.receiveShadow = true;
  house.add(wall);
  // black marble slot windows
  for (const [z, y, hgt] of [[-7, 2.1, 1.5], [7, 2.1, 1.5], [-7, 6.3, 1.4], [7, 6.3, 1.4]]) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.2, hgt, 1.1), blackMarble);
    slot.position.set(backX - 0.42, y, z);
    house.add(slot);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.06, hgt * 0.7, 0.28), new THREE.MeshBasicMaterial({ color: 0xffc27a }));
    slit.position.set(backX - 0.55, y, z);
    house.add(slit);
  }
  // pivot door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.4, 3.1), bronzeDark);
  door.position.set(backX - 0.48, 2.2, 0);
  house.add(door);
  const doorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.0, 0.14), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
  doorGlow.position.set(backX - 0.66, 2.2, 0);
  house.add(doorGlow);
}

// green roof + parapet
{
  const roofY = 8.25 + 3.2 + SLAB_T;    // 12.07
  const roof = arcRing(21.6, 0, A0, A1, 0.35, whiteConcrete, 96);
  roof.position.y = roofY;
  house.add(roof);
  const grass = arcRing(21.15, 0, A0, A1, 0.12, roofGrassMat, 96);
  grass.position.y = roofY + 0.35;
  house.add(grass);
  const parapet = arcRing(21.55, 21.0, A0, A1, 0.55, whiteConcreteEdge, 96);
  parapet.position.y = roofY + 0.35;
  house.add(parapet);
  // glass railing along the roof arc
  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(21.28, 21.28, 0.42, 72, 1, true, Math.PI * 1.5 - A_HALF, A_HALF * 2),
    new THREE.MeshPhysicalMaterial({ color: 0x9db8cc, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
  );
  rail.position.y = roofY + 0.95;
  house.add(rail);

  // ---- rooftop sky lounge: bar + sofas + fire pit (west arc, facing ocean)
  const lounge = new THREE.Group();
  lounge.position.set(0, roofY + 0.47, 0);
  house.add(lounge);
  const barDir = new THREE.Vector3(-1, 0, 0);
  const barPos = barDir.clone().multiplyScalar(18.4);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.15, 5.6), blackMarble);
  bar.position.set(barPos.x, 0.58, barPos.z);
  lounge.add(bar);
  const shelf = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.7), new THREE.MeshBasicMaterial({ map: bottleShelfTexture() }));
  shelf.position.set(barPos.x + 0.95, 1.85, 0);
  shelf.rotation.y = Math.PI / 2;
  lounge.add(shelf);
  // low sofas arranged in a conversation arc
  const sofaPositions = [
    [-15.2, -2.6, 0.5], [-15.2, 2.6, -0.5], [-13.0, -4.6, 0.95], [-13.0, 4.6, -0.95],
  ];
  for (const [x, z, rot] of sofaPositions) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.42, 2.2), new THREE.MeshStandardMaterial({ color: 0xe7e0d2, roughness: 0.9 }));
    base.position.y = 0.24; g.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 2.2), new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.9 }));
    back.position.set(0.42, 0.62, 0); g.add(back);
    g.position.set(x, 0, z); g.rotation.y = rot; g.traverse(m => { m.castShadow = true; });
    lounge.add(g);
  }
  const pit = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.35, 20), blackMarble);
  pit.position.set(-14.2, 0.18, 0);
  lounge.add(pit);
  addGlow(-14.2, roofY + 1.35, 0, 3.4, 0xff9a3a, 0.9);
  const pitLight = new THREE.PointLight(0xff8a30, 60, 20, 1.8);
  pitLight.position.set(-14.2, roofY + 1.6, 0);
  scene.add(pitLight);
}

// interior warmth audible from inside (two room volumes)
{
  const salonLight = new THREE.PointLight(0xffb469, 90, 30, 1.7);
  salonLight.position.set(-16, 2.6, 0); scene.add(salonLight);
  const bedroomLight = new THREE.PointLight(0xffc884, 70, 26, 1.7);
  bedroomLight.position.set(-15.5, 6.7, 0); scene.add(bedroomLight);
}

/* ---------------------------------------------------------- pool deck + infinity pool */
{
  const deck = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.35, 15.5), travertineMat);
  deck.position.set(-27.6, 0.18, 0);
  deck.receiveShadow = true;
  scene.add(deck);

  // basin + water
  const basin = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.62, 6.4), new THREE.MeshStandardMaterial({ color: 0x11353f, roughness: 0.4 }));
  basin.position.set(-28.9, 0.32, 0);
  scene.add(basin);

  const waterUniforms = { uTime: oceanUniforms.uTime };
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(11.3, 6.1, 1, 1),
    new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      fog: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main(){
          vec3 deep = vec3(0.02, 0.36, 0.42);
          vec3 lit  = vec3(0.19, 0.88, 0.78);
          float ripple = sin(vUv.x * 34.0 + uTime * 1.3) * 0.5 + sin(vUv.y * 47.0 - uTime * 1.7) * 0.5;
          float caustic = pow(max(0.0, sin(vUv.x * 60.0 + uTime * 2.0) * sin(vUv.y * 52.0 - uTime * 1.6)), 3.0);
          float grad = smoothstep(0.0, 1.0, vUv.y);
          vec3 col = mix(deep, lit, 0.45 + 0.3 * ripple + 0.25 * grad);
          col += vec3(0.5, 1.0, 0.9) * caustic * 0.5;
          // warm glint from house lights, west sparkle from sky
          col += vec3(1.0, 0.72, 0.45) * pow(max(0.0, sin(vUv.x * 90.0 + uTime * 2.6)), 12.0) * 0.35;
          gl_FragColor = vec4(col, 0.96);
        }`,
      transparent: true,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(-28.9, 0.64, 0);
  scene.add(water);

  const poolLight = new THREE.PointLight(0x2fe8d0, 70, 16, 1.8);
  poolLight.position.set(-29, 1.4, 0);
  scene.add(poolLight);
  addGlow(-29, 1.35, 0, 5.5, 0x27d8c4, 0.55);

  // loungers
  for (const z of [-4.4, 0, 4.4]) {
    const lounger = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.32, 0.78), new THREE.MeshStandardMaterial({ color: 0xf0ece2, roughness: 0.8 }));
    base.position.y = 0.35; lounger.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 0.78), new THREE.MeshStandardMaterial({ color: 0xf0ece2, roughness: 0.8 }));
    back.position.set(-1.05, 0.52, 0); back.rotation.z = 0.6; lounger.add(back);
    lounger.position.set(-24.6, 0.35, z);
    lounger.traverse(o => { o.castShadow = true; });
    scene.add(lounger);
  }
}

/* ---------------------------------------------------------- arrival: motor court, driveway, gate, car */
{
  // circular court
  const court = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 0.14, 48), asphaltMat);
  court.position.set(13.5, 0.07, 2);
  court.receiveShadow = true;
  scene.add(court);
  const courtRing = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.28, 10, 48), travertineMat);
  courtRing.rotation.x = Math.PI / 2;
  courtRing.position.set(13.5, 0.12, 2);
  scene.add(courtRing);

  // curved driveway — an arc sweeping in from the south-east
  const road = arcRing(46, 41.5, Math.PI * 1.08, Math.PI * 1.52, 0.1, asphaltMat, 64);
  road.position.set(13.5, 0.02, 2);
  scene.add(road);

  // gate pillars at the drive mouth (south-east)
  for (const z of [-1.5, 14.5]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 3.1, 1.15), whiteConcrete);
    pillar.position.set(43.5, 1.55, z + 6.5);
    pillar.castShadow = true;
    scene.add(pillar);
    addGlow(43.5, 3.25, z + 6.5, 1.6, 0xffc87a, 0.75);
  }

  // stone path: court -> entrance
  const path = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.09, 3.4), travertineMat);
  path.position.set(1.5, 0.05, 0);
  path.receiveShadow = true;
  scene.add(path);

  // black grand tourer parked in the court
  const car = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.62, 1.95), new THREE.MeshPhysicalMaterial({ color: 0x05070c, roughness: 0.12, metalness: 0.85, clearcoat: 1 }));
  body.position.y = 0.62; car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 1.7), new THREE.MeshPhysicalMaterial({ color: 0x0a1018, roughness: 0.05, metalness: 0.9 }));
  cabin.position.set(-0.25, 1.14, 0); car.add(cabin);
  for (const [dx, dz] of [[-1.5, -0.92], [1.5, -0.92], [-1.5, 0.92], [1.5, 0.92]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 18), new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.6 }));
    wheel.rotation.x = Math.PI / 2; wheel.position.set(dx, 0.36, dz); car.add(wheel);
  }
  const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 1.5), new THREE.MeshBasicMaterial({ color: 0xdfe8ff }));
  headlight.position.set(2.31, 0.66, 0); car.add(headlight);
  car.position.set(14.2, 0, 5.6);
  car.rotation.y = -0.5;
  car.traverse(o => { o.castShadow = true; });
  scene.add(car);

  // topiary cones + spheres framing the path axis
  const coneGeo = new THREE.ConeGeometry(0.72, 1.9, 12);
  const ballGeo = new THREE.SphereGeometry(0.66, 14, 12);
  for (const z of [-2.9, 2.9]) {
    for (const x of [4.2, 8.2]) {
      const cone = new THREE.Mesh(coneGeo, topiaryMat);
      cone.position.set(x, 0.98, z); cone.castShadow = true; scene.add(cone);
    }
    const ball = new THREE.Mesh(ballGeo, topiaryMat);
    ball.position.set(-1.8, 0.68, z); ball.castShadow = true; scene.add(ball);
  }
  // path lanterns
  for (const x of [-2.5, 1.4, 5.3, 9.2]) {
    for (const z of [-2.1, 2.1]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), bronzeDark);
      lamp.position.set(x, 0.25, z); scene.add(lamp);
      addGlow(x, 0.62, z, 0.85, 0xffc27a, 0.7);
    }
  }
}

/* ---------------------------------------------------------- planting: palms, hedges, cypresses */
function makePalm(height = 7.5, lean = 0.12) {
  const palm = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.4, height, 9, 6, true);
  // gentle lean curve
  const pos = trunkGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y / height + 0.5);
    pos.setX(i, pos.getX(i) + t * t * height * lean);
  }
  trunkGeo.computeVertexNormals();
  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  trunk.position.y = height / 2;
  trunk.castShadow = true;
  palm.add(trunk);
  // crown of curved fronds
  const frondCount = 13;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2 + Math.random() * 0.3;
    const tilt = 0.55 + Math.random() * 0.5;                 // droop
    const frondGeo = new THREE.PlaneGeometry(0.75, 3.1, 1, 6);
    const fp = frondGeo.attributes.position;
    for (let j = 0; j < fp.count; j++) {
      const y = fp.getY(j);
      const t = (y + 1.55) / 3.1;                            // 0 at base -> 1 at tip
      fp.setZ(j, Math.pow(t, 1.8) * -1.65);                  // arc downward
      fp.setX(j, fp.getX(j) * (1.0 - t * 0.72));             // taper to tip
    }
    frondGeo.computeVertexNormals();
    const frond = new THREE.Mesh(frondGeo, new THREE.MeshStandardMaterial({ color: 0x23512a, roughness: 0.85, side: THREE.DoubleSide }));
    frond.position.set(height * lean, height + 0.12, 0);
    frond.rotation.order = 'YXZ';
    frond.rotation.y = angle;
    frond.rotation.x = tilt;
    frond.castShadow = true;
    palm.add(frond);
  }
  // coconut cluster
  const nuts = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshStandardMaterial({ color: 0x40301c, roughness: 0.8 }));
  nuts.position.set(height * lean, height, 0);
  palm.add(nuts);
  return palm;
}
{
  const palmSpots = [
    [-23.5, -6.8, 8.2, 0.10], [-23.5, 6.8, 8.2, 0.10],      // pool flanks
    [-4.5, -15.5, 9.4, 0.14], [-4.5, 15.5, 9.4, 0.14],      // house garden flanks
    [8.5, -9.5, 6.6, 0.2], [8.5, 9.5, 6.6, 0.2],            // terrace steps
    [26, -14, 7.6, 0.16], [27.5, 15.5, 8.8, 0.12],          // court edges
    [-17.5, -12.3, 7.0, 0.18], [-17.5, 12.3, 7.0, 0.18],    // bluff rim
    [-8, -2.0, 5.6, 0.22], [-8, 2.0, 5.6, 0.22],            // entry pair? (scaled smaller)
  ];
  for (const [x, z, h, lean] of palmSpots) {
    const palm = makePalm(h, lean);
    palm.position.set(x, 0, z);
    palm.rotation.y = Math.random() * Math.PI * 2;
    scene.add(palm);
  }
  // garden hedge terraces on the east slope
  const hedgeGeo = new THREE.BoxGeometry(1.5, 0.9, 0.9);
  for (let i = 0; i < 22; i++) {
    const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
    const t = i / 22;
    hedge.position.set(24 + Math.sin(t * 9) * 6, 0.45, -19 + t * 38);
    hedge.rotation.y = t * 3;
    hedge.castShadow = true;
    scene.add(hedge);
  }
  // cypress silhouettes on the east ridge
  const cypGeo = new THREE.ConeGeometry(0.9, 4.6, 8);
  const cypMat = new THREE.MeshStandardMaterial({ color: 0x16241a, roughness: 1 });
  for (let i = 0; i < 14; i++) {
    const cyp = new THREE.Mesh(cypGeo, cypMat);
    cyp.position.set(44 + Math.random() * 30, 2.2 + Math.random() * 0.6, -26 + i * 4.1 + Math.random() * 1.6);
    scene.add(cyp);
  }
}

/* ---------------------------------------------------------- camera tour + captions */
const tourCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(46, 7.5, 34),      // 0  arrival, high SE
  new THREE.Vector3(30, 3.6, 24),      // 1  garden approach
  new THREE.Vector3(11, 2.6, 27.5),    // 2  east terrace low angle
  new THREE.Vector3(-6, 2.4, 17),      // 3  SE corner, pool ahead
  new THREE.Vector3(-24.5, 2.4, 8.5),  // 4  pool deck — the money shot
  new THREE.Vector3(-31.5, 2.1, -2.5), // 5  infinity edge
  new THREE.Vector3(-25.5, 4.2, -15.5),// 6  SW facade, ember band behind
  new THREE.Vector3(-10.5, 12.5, -26), // 7  rising aerial
  new THREE.Vector3(9, 21.5, -23.5),   // 8  aerial — green roof reveal
  new THREE.Vector3(23.5, 10.5, -11),  // 9  descending SE
  new THREE.Vector3(26.5, 4.6, 5.5),   // 10 east return, court passes below
  new THREE.Vector3(13, 5.0, 20.5),    // 11 NE return toward arrival
], true, 'centripetal', 0.35);

const lookCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(6, 3.2, 0),        // arrival: court & door
  new THREE.Vector3(2, 3.0, 0),
  new THREE.Vector3(-14, 4.0, 0),      // east terraces
  new THREE.Vector3(-20, 2.6, 0),
  new THREE.Vector3(-28.5, 1.2, 0),    // pool
  new THREE.Vector3(-16, 6.0, 0),      // infinity edge: back to house + sky band
  new THREE.Vector3(-14, 6.5, 0),
  new THREE.Vector3(-15, 8.0, 0),      // aerial: green roof
  new THREE.Vector3(-14, 9.0, 0),
  new THREE.Vector3(-14, 6.0, 0),
  new THREE.Vector3(-2, 3.4, 0),
  new THREE.Vector3(-4, 3.4, 0),
], true, 'centripetal', 0.35);

const BEATS = [
  [0.000, 'ARRIVAL — THE MOTOR COURT'],
  [0.085, 'THE GARDEN APPROACH'],
  [0.170, 'THE TERRACED EAST PROFILE'],
  [0.265, 'THE INFINITY POOL — TWILIGHT'],
  [0.350, 'INFINITY EDGE — THE OCEAN HORIZON'],
  [0.435, 'WEST FACADE — DEEPEST BLUE HOUR'],
  [0.525, 'THE LIVING GREEN ROOF — AERIAL'],
  [0.615, 'THE COASTAL BLUFF — PANORAMA'],
  [0.705, 'THE ROOFTOP SKY LOUNGE — FROM ABOVE'],
  [0.800, 'CURVED CONCRETE & GLASS'],
  [0.905, 'MANSION VISION — THE MODERN HILLSIDE PALACE'],
];

const TOUR_DURATION = 150;   // seconds, a slow burn
let tourT = 0;
let mode = 'tour';           // 'tour' | 'orbit'

/* ---------------------------------------------------------- input: minimal orbit */
const orbit = { theta: 0.9, phi: 1.08, radius: 68, target: new THREE.Vector3(-8, 5, 0) };
const pointers = new Map();
let lastPinch = 0;

function applyOrbit() {
  const { theta, phi, radius, target } = orbit;
  camera.position.set(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(target);
}
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]); });
canvas.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  const [px, py] = pointers.get(e.pointerId);
  const dx = e.clientX - px, dy = e.clientY - py;
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (mode === 'orbit') {
    orbit.theta -= dx * 0.0052;
    orbit.phi = THREE.MathUtils.clamp(orbit.phi - dy * 0.0042, 0.32, 1.48);
    applyOrbit();
  }
});
canvas.addEventListener('pointerup', e => pointers.delete(e.pointerId));
canvas.addEventListener('pointercancel', e => pointers.delete(e.pointerId));
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  if (mode === 'orbit') {
    orbit.radius = THREE.MathUtils.clamp(orbit.radius * (1 + Math.sign(e.deltaY) * 0.08), 12, 170);
    applyOrbit();
  }
}, { passive: false });

/* ---------------------------------------------------------- UI wiring */
const btnPlay = document.getElementById('btn-play');
const btnFree = document.getElementById('btn-free');
const btnAmbience = document.getElementById('btn-ambience');
const captionEl = document.getElementById('caption');
const progressEl = document.getElementById('progress-bar');
const veil = document.getElementById('veil');
let captionText = '';
let captionAlpha = 0;

function setMode(next) {
  mode = next;
  btnPlay.classList.toggle('active', mode === 'tour');
  btnFree.classList.toggle('active', mode === 'orbit');
  if (mode === 'orbit') applyOrbit();
}
btnPlay.addEventListener('click', () => { tourT = 0; setMode('tour'); });
btnFree.addEventListener('click', () => setMode('orbit'));

// ambient ocean — generated brown noise, off by default
let audioCtx = null, ambientGain = null, ambientOn = false;
function toggleAmbience() {
  ambientOn = !ambientOn;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const len = 4 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {           // brown noise
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass'; lowpass.frequency.value = 420; lowpass.Q.value = 0.6;
    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0.0;
    // slow swell LFO
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoDepth = audioCtx.createGain();
    lfoDepth.gain.value = 0.035;
    lfo.connect(lfoDepth); lfoDepth.connect(ambientGain.gain);
    src.connect(lowpass); lowpass.connect(ambientGain); ambientGain.connect(audioCtx.destination);
    src.start(); lfo.start();
  }
  audioCtx.resume();
  ambientGain.gain.cancelScheduledValues(audioCtx.currentTime);
  ambientGain.gain.setTargetAtTime(ambientOn ? 0.085 : 0.0, audioCtx.currentTime, 0.8);
  btnAmbience.textContent = ambientOn ? '🌊 Ambience · On' : '🌊 Ambience · Off';
  btnAmbience.classList.toggle('active', ambientOn);
}
btnAmbience.addEventListener('click', toggleAmbience);

setMode('tour');

/* ---------------------------------------------------------- main loop */
const clock = new THREE.Clock();
let firstFrame = true;

function updateCaption(t) {
  let current = BEATS[0][1];
  for (const [bt, label] of BEATS) if (t >= bt) current = label;
  if (current !== captionText) { captionText = current; captionEl.textContent = current; captionAlpha = 0; }
}

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  oceanUniforms.uTime.value = time;
  sky.material.uniforms.uTime.value = time;

  if (mode === 'tour') {
    tourT = (tourT + dt / TOUR_DURATION) % 1;
    const p = tourCurve.getPointAt(tourT);
    const look = lookCurve.getPointAt(tourT);
    camera.position.copy(p);
    camera.lookAt(look);
    progressEl.style.transform = `scaleX(${tourT})`;
    updateCaption(tourT);
  } else {
    progressEl.style.transform = 'scaleX(0)';
    if (captionText !== 'FREE LOOK — DRAG TO ORBIT · SCROLL TO ZOOM') {
      captionText = 'FREE LOOK — DRAG TO ORBIT · SCROLL TO ZOOM';
      captionEl.textContent = captionText;
    }
  }
  // caption fade in
  captionAlpha = Math.min(1, captionAlpha + dt * 1.4);
  captionEl.style.opacity = captionAlpha.toFixed(3);

  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    veil.classList.add('hidden');
  }
}
tick();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
