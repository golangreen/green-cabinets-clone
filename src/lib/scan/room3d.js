/* Ported from the Punchlee app (same owner). Draws a RoomPlan scan in 3D.
   Kept as plain JS so it stays a drop-in copy; types live in room3d.d.ts. */
/* The scanned rooms in 3D: walls with their doors and windows cut out,
   the floors, and the fixed things (cabinets, fridge, tub...). One finger
   turns it, two fingers pinch to zoom and slide to move, a tap on a wall,
   door, window or object reports what it is and its sizes.
   Loaded on demand (import("./room3d.js")) so three.js stays out of the
   app's first download. Coordinates are RoomPlan's: metres, y up, the
   plan's x and z on the floor. */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const WALL_T = 0.1;
let Mat = null; // set per view: full shading, or the cheaper kind in light mode
const OBJ_COLOR = {
  cabinet: 0xc9a77c, table: 0xb98b5e, fridge: 0xd5dade, stove: 0xb9bec4, oven: 0xb9bec4, dishwasher: 0xd5dade, washer: 0xd5dade,
  sink: 0xf2f5f8, toilet: 0xf2f5f8, tub: 0xf2f5f8, bed: 0xa9b7c6, sofa: 0x9fb0a0, chair: 0x9fb0a0, fireplace: 0x8d7f74,
  tv: 0x3a3f45, stairs: 0xc9b9a0,
};
const ROOM_TINT = [0xf3ede0, 0xe8eef2, 0xeef0e4, 0xf3e6e6, 0xe9e6f3, 0xe6f3ef];

// Where the floor is: the scan's floors, else the walls' bottoms, else 0
// (older scans saved no heights).
function floorLevel(room) {
  const fy = (room.floors || []).map((f) => f.y).filter((y) => typeof y === "number");
  if (fy.length) return Math.min(...fy);
  const wy = (room.walls || []).filter((w) => typeof w.y === "number").map((w) => w.y - w.h / 2);
  return wy.length ? Math.min(...wy) : 0;
}

// Doors, windows and openings that sit in this wall, as spans along it.
function holesIn(w, room, fy) {
  const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1], len = Math.hypot(ax, az) || 1;
  const ux = ax / len, uz = az / len;
  const H = w.h;
  const out = [];
  for (const kind of ["doors", "windows", "openings"]) {
    (room[kind] || []).forEach((o, i) => {
      const mx = (o.a[0] + o.b[0]) / 2 - w.a[0], mz = (o.a[1] + o.b[1]) / 2 - w.a[1];
      const s = mx * ux + mz * uz, off = Math.abs(mx * uz - mz * ux);
      if (off > 0.25 || s < -0.1 || s > len + 0.1) return;
      // Parallel to the wall only (a door in the crossing wall can sit near its end).
      const olen = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]) || 1;
      if (Math.abs(((o.b[0] - o.a[0]) * ux + (o.b[1] - o.a[1]) * uz) / olen) < 0.8) return;
      let bot;
      if (typeof o.y === "number") bot = o.y - o.h / 2 - fy;
      else bot = kind === "windows" ? Math.max(0.3, Math.min(0.9, H - o.h - 0.15)) : 0;
      bot = Math.max(0, bot);
      const top = Math.min(H, bot + o.h);
      const s0 = Math.max(0, s - o.len / 2), s1 = Math.min(len, s + o.len / 2);
      if (s1 - s0 > 0.05 && top - bot > 0.05) out.push({ kind, i, o, s0, s1, bot, top });
    });
  }
  return out.sort((p, q) => p.s0 - q.s0);
}

export function mountRoom3D(el, room, { names = [], parts = [], fmt = (m) => `${m.toFixed(2)} m`, area = (a) => `${a.toFixed(1)} m²`, onPick, onLost, light = false, onPerf, transparent = false } = {}) {
  // light: for weaker phones - no smoothing, no outlines, simpler shading,
  // lower sharpness. Every size and name is the same.
  const fy = floorLevel(room);
  let dirty = true, raf = 0, alive = true, zoomRun = 0;
  const walls = room.walls || [];
  const pts = [...walls.flatMap((w) => [w.a, w.b]), ...(room.objects || []).map((o) => o.c)];
  const minX = Math.min(...pts.map((p) => p[0])), maxX = Math.max(...pts.map((p) => p[0]));
  const minZ = Math.min(...pts.map((p) => p[1])), maxZ = Math.max(...pts.map((p) => p[1]));
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  const span = Math.max(maxX - minX, maxZ - minZ, 2);
  const topH = Math.max(2.4, ...walls.map((w) => w.h));

  // Throws where WebGL is missing; the caller shows the flat plan instead.
  Mat = light ? (o) => { const { roughness, metalness, ...rest } = o; return new THREE.MeshLambertMaterial(rest); } : (o) => new THREE.MeshStandardMaterial(o);
  // window.__plTransparent: the screenshot harness only (store art), never set by the app.
  const storeArt = typeof window !== "undefined" && !!window.__plTransparent;
  // transparent: the app's own card color shows behind the plan.
  const clearAlpha = storeArt || transparent ? 0 : 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !light, alpha: clearAlpha === 0, powerPreference: "default", preserveDrawingBuffer: storeArt });
  renderer.setClearColor(0xf1efea, clearAlpha);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none;outline:none";
  el.appendChild(renderer.domElement);
  const labelLayer = document.createElement("div");
  labelLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden";
  el.appendChild(labelLayer);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a6, 2.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(span * 0.6, span * 1.4, span * 0.9);
  scene.add(sun);
  const world = new THREE.Group();
  world.position.set(-cx, 0, -cz);
  scene.add(world);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, span * 20);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.maxPolarAngle = Math.PI / 2 - 0.04; // never under the floor
  controls.minDistance = 0.5;
  controls.maxDistance = span * 10;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.screenSpacePanning = false; // slide along the floor, not up into the sky
  controls.zoomToCursor = true;

  const pickables = [];
  const wallSets = []; // { mats, n, mid } per wall, for the cut-away
  const edgeMat = () => new THREE.LineBasicMaterial({ color: 0x6f675b, transparent: true });
  const addBox = (group, w, h, d, x, y, z, rot, mat, info, edges = true) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.rotation.y = rot;
    m.userData.info = info;
    group.add(m);
    pickables.push(m);
    if (edges && !light) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), edges === true ? edgeMat() : edges);
      e.position.copy(m.position); e.rotation.y = rot;
      group.add(e);
      m.userData.edge = e;
    }
    return m;
  };

  // Floors: each room's outline, a soft tint per room.
  const floorPolys = (room.floors || []).filter((f) => f.poly?.length >= 3).map((f) => f.poly);
  if (!floorPolys.length && pts.length >= 3) {
    // No floor outline (iOS 16 scans): the box around the walls.
    floorPolys.push([[minX, minZ], [maxX, minZ], [maxX, maxZ], [minX, maxZ]]);
  }
  floorPolys.forEach((poly, i) => {
    const shape = new THREE.Shape(poly.map((p) => new THREE.Vector2(p[0], -p[1])));
    const g = new THREE.ShapeGeometry(shape);
    const m = new THREE.Mesh(g, Mat({ color: ROOM_TINT[i % ROOM_TINT.length], roughness: 0.95, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.001;
    world.add(m);
  });

  // Walls, built in pieces around their doors and windows.
  const centre = [cx, cz];
  walls.forEach((w, wi) => {
    const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
    if (len < 0.05) return;
    const ux = (w.b[0] - w.a[0]) / len, uz = (w.b[1] - w.a[1]) / len;
    const rot = Math.atan2(-uz, ux);
    const bot0 = typeof w.y === "number" ? Math.max(0, w.y - w.h / 2 - fy) : 0;
    const H = w.h;
    const mid = [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2];
    let n = [-uz, ux];
    if (n[0] * (mid[0] - centre[0]) + n[1] * (mid[1] - centre[1]) < 0) n = [uz, -ux];
    const mat = Mat({ color: 0xece8df, roughness: 0.9, transparent: true });
    const em = edgeMat();
    const set = { mats: [mat, em], n, mid, glass: [] };
    wallSets[wi] = set;
    const at = (s) => [w.a[0] + ux * s, w.a[1] + uz * s];
    const info = { kind: "wall", len, h: H, wall: wi };
    const piece = (s0, s1, y0, y1) => {
      if (s1 - s0 < 0.005 || y1 - y0 < 0.005) return;
      const p = at((s0 + s1) / 2);
      addBox(world, s1 - s0, y1 - y0, WALL_T, p[0], bot0 + (y0 + y1) / 2, p[1], rot, mat, info, em);
    };
    let cur = 0;
    for (const hole of holesIn(w, room, fy + bot0)) {
      const s0 = Math.max(cur, hole.s0);
      if (s0 >= hole.s1) continue;
      piece(cur, s0, 0, H);
      piece(s0, hole.s1, 0, hole.bot);
      piece(s0, hole.s1, hole.top, H);
      const p = at((s0 + hole.s1) / 2), hw = hole.s1 - s0, hh = hole.top - hole.bot;
      const hinfo = { kind: hole.kind === "doors" ? "door" : hole.kind === "windows" ? "window" : "opening", w: hole.o.len, h: hole.o.h, off: hole.bot, open: hole.o.open };
      if (hole.kind === "windows") {
        const gm = Mat({ color: 0x8ec9ec, transparent: true, opacity: 0.38, roughness: 0.1, metalness: 0.1 });
        const fm = new THREE.LineBasicMaterial({ color: 0x3b7fb0, transparent: true });
        set.glass.push([gm, 0.38], [fm, 1]);
        addBox(world, hw, hh, 0.025, p[0], bot0 + (hole.bot + hole.top) / 2, p[1], rot, gm, hinfo, fm);
      } else if (hole.kind === "doors") {
        const dm = Mat({ color: 0xa47b52, transparent: true, opacity: 0.85, roughness: 0.7 });
        set.glass.push([dm, 0.85]);
        if (hole.o.open) {
          // Open door: the leaf swung into the room from its hinge side.
          const hinge = at(s0);
          const r2 = rot + Math.PI / 2 * (n[0] * -uz + n[1] * ux > 0 ? 1 : -1) * 0.9;
          const d = new THREE.Vector2(Math.cos(r2), -Math.sin(r2));
          addBox(world, hw, hh, 0.035, hinge[0] + d.x * hw / 2, bot0 + (hole.bot + hole.top) / 2, hinge[1] + d.y * hw / 2, r2, dm, hinfo, false);
        } else {
          addBox(world, hw, hh, 0.04, p[0], bot0 + (hole.bot + hole.top) / 2, p[1], rot, dm, hinfo, false);
        }
      } else {
        // An opening: an invisible target so a tap still reports its size.
        const om = new THREE.MeshBasicMaterial({ visible: false });
        addBox(world, hw, hh, WALL_T, p[0], bot0 + (hole.bot + hole.top) / 2, p[1], rot, om, hinfo, false);
      }
      cur = hole.s1;
    }
    piece(cur, len, 0, H);
  });

  // Fixed things as simple blocks.
  (room.objects || []).forEach((o) => {
    const rot = Math.atan2(-o.ax[1], o.ax[0]);
    const bot = typeof o.y === "number" ? Math.max(0, o.y - o.h / 2 - fy) : 0;
    const mat = Mat({ color: OBJ_COLOR[o.cat] ?? 0xcfc7ba, roughness: 0.75 });
    addBox(world, o.w, o.h, o.d, o.c[0], bot + o.h / 2, o.c[1], rot, mat, { kind: "object", cat: o.cat, w: o.w, d: o.d, h: o.h });
  });

  // Room names floating over each floor, and wall lengths on the walls you can see.
  const labels = [];
  const mkLabel = (text, strong) => {
    const d = document.createElement("div");
    d.textContent = text;
    d.style.cssText = `position:absolute;left:0;top:0;white-space:pre;text-align:center;font:${strong ? "800 13px" : "700 11px"} -apple-system,Helvetica,Arial,sans-serif;` +
      `color:${strong ? "#1f2421" : "#3d3a34"};background:rgba(255,255,255,${strong ? 0.88 : 0.8});padding:${strong ? "3px 8px" : "1px 5px"};border-radius:7px;` +
      "box-shadow:0 1px 3px rgba(0,0,0,.18);will-change:transform;direction:ltr;unicode-bidi:isolate";
    labelLayer.appendChild(d);
    return d;
  };
  parts.forEach((r, i) => {
    if (!r.c) return;
    const nm = (names[i] || "").trim();
    const text = [nm, r.area != null ? area(r.area) : ""].filter(Boolean).join("\n");
    if (text) labels.push({ el: mkLabel(text, true), p: new THREE.Vector3(r.c[0] - cx, 0.05, r.c[1] - cz - 0.45), room: true }); // a little behind the centre: item pins line up in front of it
  });
  walls.forEach((w, wi) => {
    if (w.len < 0.3) return;
    const set = wallSets[wi];
    labels.push({ el: mkLabel(fmt(w.len)), p: new THREE.Vector3((w.a[0] + w.b[0]) / 2 - cx, (typeof w.y === "number" ? w.y + w.h / 2 - fy : w.h) + 0.08, (w.a[1] + w.b[1]) / 2 - cz), set });
  });
  let showSizes = true;

  // Picking: a tap (not a drag) on something reports it and outlines it.
  const ray = new THREE.Raycaster();
  let picked = null;
  const highlight = (m) => {
    if (picked) { picked.material.emissive?.setHex(0x000000); }
    picked = m;
    if (m?.material.emissive) m.material.emissive.setHex(0x3a2a00);
    dirty = true;
  };
  let down = null;
  // Pins, like a map's: a tap opens one; a drag or pinch that starts on a pin
  // turns and zooms the view as usual; press and hold a pin and it lifts, then
  // a drag moves it along the floor. The pins never take a finger away from
  // the camera controls (doing that mid-pinch made the view jump).
  const fingers = new Set();
  let held = null; // { pin, id, x, y, timer, lifted }
  const pinAt = (cx, cy) => {
    const r = renderer.domElement.getBoundingClientRect();
    const x = cx - r.left, y = cy - r.top;
    let best = null, bd = Infinity;
    for (const p of pins) {
      if (p.sx == null || p.el.style.display === "none") continue;
      const dx = x - p.sx, dy = y - (p.sy - 20); // the pin's head sits above its tip
      if (Math.abs(dx) > 22 || dy < -24 || dy > 24) continue; // 44x48 tap zone
      const d = Math.hypot(dx, dy);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  };
  const onDown = (e) => {
    fingers.add(e.pointerId);
    down = fingers.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    if (held) { clearTimeout(held.timer); if (!held.lifted) held = null; }
    const pin = fingers.size === 1 ? pinAt(e.clientX, e.clientY) : null;
    if (!pin) return;
    const h = { pin, id: e.pointerId, x: e.clientX, y: e.clientY, lifted: false };
    if (pinMove) h.timer = setTimeout(() => {
      if (held !== h || fingers.size !== 1) return;
      h.lifted = true;
      controls.enabled = false; // only now, with one finger down: the controls' own count stays right
      pin.el.style.scale = "1.2";
      navigator.vibrate?.(12);
      dirty = true;
    }, 420);
    held = h;
  };
  const onMoveP = (e) => {
    const h = held;
    if (!h || h.id !== e.pointerId) return;
    if (!h.lifted) { if (Math.hypot(e.clientX - h.x, e.clientY - h.y) > 8) { clearTimeout(h.timer); held = null; } return; }
    const f = floorAt(e.clientX, e.clientY);
    if (f) { h.pin.pos.set(f[0] - cx, 0, f[1] - cz); dirty = true; }
  };
  const endHeld = (e, cancel) => {
    fingers.delete(e.pointerId);
    const h = held;
    if (!h || h.id !== e.pointerId) return false;
    held = null; clearTimeout(h.timer);
    if (h.lifted) {
      controls.enabled = true;
      h.pin.el.style.scale = "";
      if (!cancel) pinMove?.(h.pin.id, [h.pin.pos.x + cx, h.pin.pos.z + cz]);
      dirty = true;
      return true;
    }
    if (!cancel && Math.hypot(e.clientX - h.x, e.clientY - h.y) <= 8) { down = null; pinTap?.(h.pin.id); return true; }
    return false;
  };
  const onUp = (e) => {
    if (endHeld(e, false)) return;
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7 || performance.now() - down.t > 600) { down = null; return; }
    down = null;
    const r = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    // Faded front walls let the tap through to what is behind them.
    const hit = ray.intersectObjects(pickables, false).find((h) => h.object.userData.info.kind === "opening" || (h.object.material.opacity ?? 1) > 0.3);
    if (!hit) { highlight(null); onPick?.(null); return; }
    highlight(hit.object);
    onPick?.(hit.object.userData.info);
  };
  const onCancelP = (e) => endHeld(e, true);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointermove", onMoveP);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointercancel", onCancelP);

  // Views: a 3/4 look from the front corner, or straight down.
  const target = new THREE.Vector3(0, topH * 0.3, 0);
  const view = (kind) => {
    // Far enough that the whole place fits the screen, phone-narrow or wide.
    const r = Math.hypot((maxX - minX) / 2, (maxZ - minZ) / 2, topH / 2) + 0.3;
    const vf = (camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const dist = r / Math.sin(Math.min(vf, hf) / 2);
    controls.target.copy(target);
    if (kind === "top") camera.position.set(0, dist * 1.25, 0.001);
    else camera.position.set(dist * 0.42, dist * 0.6, dist * 0.68);
    camera.lookAt(controls.target);
    controls.update();
    dirty = true;
  };

  // Sharp but bounded: at most 2x, and never more than ~3.5 million pixels
  // (a full-screen iPad or Mac would otherwise draw 4-5x the work of a phone).
  const size = () => {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    const art = storeArt; // store-art harness: draw at full resolution
    let pr = Math.min(window.devicePixelRatio || 1, art ? 4 : light ? 1.25 : 2);
    while (pr > 1 && w * h * pr * pr > (art ? 4e7 : light ? 1.2e6 : 3.5e6)) pr -= 0.25;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const ro = new ResizeObserver(size);
  ro.observe(el);
  size();
  view("corner");

  // Walls between the eye and the middle fade out (a dollhouse cut-away),
  // except when looking straight down.
  const cutaway = () => {
    const dx = camera.position.x - controls.target.x, dz = camera.position.z - controls.target.z;
    const hl = Math.hypot(dx, dz), steep = Math.atan2(camera.position.y - controls.target.y, hl) > 1.2;
    const vx = hl ? dx / hl : 0, vz = hl ? dz / hl : 0;
    for (const s of wallSets) {
      if (!s) continue;
      const front = !steep && s.n[0] * vx + s.n[1] * vz > 0.25 && (s.mid[0] - cx) * vx + (s.mid[1] - cz) * vz > 0;
      const k = front ? 0.12 : 1;
      s.faded = front;
      s.mats[0].opacity = k; s.mats[1].opacity = front ? 0.25 : 1;
      s.mats[0].depthWrite = !front;
      for (const [m, o] of s.glass) m.opacity = o * (front ? 0.3 : 1);
    }
  };

  // Item pins: numbered dots standing on the floor, always on top. A tap
  // opens the item; when moving is allowed, a drag slides it along the floor.
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const floorAt = (clientX, clientY) => {
    const r = renderer.domElement.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
    ray.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.ray.intersectPlane(floorPlane, new THREE.Vector3());
    return hit ? [hit.x + cx, hit.z + cz] : null;
  };
  let pins = [];
  let pinTap = null, pinMove = null;
  const setPins = (list, { onTap, onMove } = {}) => {
    pinTap = onTap || null; pinMove = onMove || null;
    if (held) { clearTimeout(held.timer); held = null; controls.enabled = true; }
    for (const p of pins) p.el.remove();
    pins = list.map((p) => {
      // A map pin (same drawing as the flat plan's): tip on the floor spot, number in the head.
      const d = document.createElement("button");
      d.setAttribute("aria-label", p.title || p.label);
      d.dataset.pin = p.label;
      const k = p.focus ? 1.25 : 1;
      d.style.cssText = `position:absolute;left:0;top:0;width:${28 * k}px;height:${36 * k}px;margin:0;padding:0;border:none;background:none;` +
        `pointer-events:none;touch-action:none;will-change:transform;transform-origin:50% 100%;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))`;
      d.innerHTML = `<svg width="${28 * k}" height="${36 * k}" viewBox="0 0 28 36" style="display:block;overflow:visible"><path d="M14 35C14 35 2.5 21.8 2.5 13.5a11.5 11.5 0 1 1 23 0C25.5 21.8 14 35 14 35z" fill="${p.color}" stroke="${p.focus ? "#FFB020" : "#fff"}" stroke-width="${p.focus ? 2.6 : 2}"${p.approx ? ' stroke-dasharray="3.2 2.4"' : ""}/>` +
        `<text x="14" y="17.6" text-anchor="middle" font-size="${p.label.length > 2 ? 9.5 : 12}" font-weight="800" fill="#fff" font-family="-apple-system,Helvetica,Arial,sans-serif">${p.label}</text></svg>`;
      labelLayer.appendChild(d);
      const pin = { ...p, el: d, pos: new THREE.Vector3(p.wx - cx, 0, p.wz - cz) };
      // Keyboard / screen reader: the button still opens the item.
      d.addEventListener("click", (e) => { if (e.detail === 0) pinTap?.(p.id); });
      return pin;
    });
    dirty = true;
  };

  const v = new THREE.Vector3();
  let wasCompact = null;
  const labelTop = parseFloat(getComputedStyle(el).getPropertyValue("--label-top")) || 0;
  const labelBottom = parseFloat(getComputedStyle(el).getPropertyValue("--label-bottom")) || 0;
  const placeLabels = () => {
    const w = el.clientWidth, h = el.clientHeight;
    const pinBoxes = [];
    for (const p of pins) {
      v.copy(p.pos).project(camera);
      if (v.z > 1) { p.el.style.display = "none"; continue; }
      p.el.style.display = "";
      const px = ((v.x + 1) / 2) * w, py = ((1 - v.y) / 2) * h;
      p.el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`; // tip on the spot
      pinBoxes.push({ x: px - 14, y: py - 36, w: 28, h: 36 });
      p.sx = px; p.sy = py;
    }
    // What a room name must not cover: names already placed, the item pins,
    // and a strip along the top the page may keep for its own tags (--label-top).
    const placed = [];
    if (labelTop > 0) placed.push({ x: -9999, y: -9999, w: 99999, h: 9999 + labelTop });
    if (labelBottom > 0) placed.push({ x: -9999, y: h - labelBottom, w: 99999, h: 9999 });
    const rooms = [];
    for (const l of labels) {
      const hide = (!l.room && (!showSizes || l.set?.faded));
      v.copy(l.p).project(camera);
      if (hide || v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1) { l.el.style.display = "none"; continue; }
      l.el.style.display = "";
      const sx = ((v.x + 1) / 2) * w, sy = ((1 - v.y) / 2) * h;
      if (l.room) { rooms.push({ l, sx, sy }); continue; }
      l.el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
    }
    // Room names sit just above their spot, clear of the item pins below it.
    // Two names that would cover each other: the lower one on screen steps
    // down below its spot instead, then sideways - never stacked unreadably.
    placed.push(...pinBoxes);
    rooms.sort((a, b) => a.sy - b.sy);
    // A small view (a phone card) gets smaller names, so they fit beside each other.
    const compact = w < 520;
    if (compact !== wasCompact) {
      wasCompact = compact;
      for (const r of labels) if (r.room) { r.el.style.font = `800 ${compact ? 11 : 13}px -apple-system,Helvetica,Arial,sans-serif`; r.el.style.padding = compact ? "2px 6px" : "3px 8px"; }
    }
    const hit = (b) => placed.reduce((sum, o) => {
      const ox = Math.min(b.x + b.w + 4, o.x + o.w + 4) - Math.max(b.x, o.x), oy = Math.min(b.y + b.h + 4, o.y + o.h + 4) - Math.max(b.y, o.y);
      return sum + (ox > 0 && oy > 0 ? ox * oy : 0);
    }, 0);
    for (const r of rooms) {
      const lw = r.l.el.offsetWidth || 80, lh = r.l.el.offsetHeight || 34;
      const tries = [[0, -40 - lh], [0, 14], [lw * 0.6, -lh / 2], [-lw * 0.6, -lh / 2], [0, -40 - 2 * lh - 6], [0, 20 + lh], [lw * 0.9, -40 - lh], [-lw * 0.9, -40 - lh]];
      let box = null, best = Infinity;
      for (const [dx, dy] of tries) {
        const b = { x: Math.min(w - lw - 4, Math.max(4, r.sx - lw / 2 + dx)), y: Math.min(h - lh - 4, Math.max(4, r.sy + dy)), w: lw, h: lh };
        const o = hit(b);
        if (o < best) { best = o; box = b; }
        if (!o) break;
      }
      placed.push(box);
      r.l.el.style.transform = `translate(${box.x}px, ${box.y}px)`;
    }
  };

  controls.addEventListener("change", () => { dirty = true; });
  // Rest whenever nobody can see it: scrolled away, the app in the
  // background, covered (paused by the page), or the GPU taken away.
  let visible = true, paused = false, lost = false, still = false, last = 0;
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; dirty = true; }) : null;
  io?.observe(el);
  // iOS can drop the 3D under memory pressure; tell the page so it rebuilds it.
  const onCtxLost = (e) => { e.preventDefault(); lost = true; onLost?.(); };
  renderer.domElement.addEventListener("webglcontextlost", onCtxLost);
  // The first time on a phone: draw ~24 frames in a row and time them, so
  // the page can step down to light 3D (or the flat plan) if it's too slow.
  let probe = onPerf ? { n: 0, ts: [] } : null;
  let fly = null; // a short camera move to one room
  const loop = (now) => {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    if (lost || paused || !visible || document.hidden) return;
    if (probe) {
      probe.ts.push(now); dirty = true;
      if (probe.ts.length >= 24) {
        const gaps = probe.ts.slice(4).map((t, i) => t - probe.ts[i + 3]).sort((a, b) => a - b);
        const ms = gaps[Math.floor(gaps.length / 2)];
        probe = null;
        onPerf(ms);
      }
    }
    if (still && now - last < 33) return; // the turning picture needs 30 frames a second, not 60-120
    last = now;
    if (fly) {
      const k = Math.min(1, (now - fly.t0) / 450), e = k * k * (3 - 2 * k); // smooth start and stop
      camera.position.lerpVectors(fly.p0, fly.p1, e);
      controls.target.lerpVectors(fly.q0, fly.q1, e);
      if (k >= 1) fly = null;
      dirty = true;
    }
    controls.update();
    if (dirty) {
      cutaway();
      renderer.render(scene, camera);
      placeLabels();
      dirty = false;
    }
  };
  raf = requestAnimationFrame(loop);

  return {
    view,
    // The buttons glide in and out, like a pinch, instead of jumping.
    zoom: (f) => {
      const len0 = camera.position.clone().sub(controls.target).length();
      const len1 = Math.min(controls.maxDistance, Math.max(controls.minDistance, len0 / f));
      const t0 = performance.now(), id = ++zoomRun;
      const step = (now) => {
        if (id !== zoomRun || !alive) return;
        const k = Math.min(1, (now - t0) / 260), e = 1 - Math.pow(1 - k, 3);
        const off = camera.position.clone().sub(controls.target);
        off.setLength(len0 * Math.pow(len1 / len0, e));
        camera.position.copy(controls.target).add(off);
        controls.update();
        dirty = true;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    sizes: (on) => { showSizes = on; dirty = true; },
    // What is on screen as a picture: the 3D view plus the names, sizes and
    // pins drawn on top of it (those are page elements, not part of the 3D).
    snapshot: () => {
      renderer.render(scene, camera);
      placeLabels();
      const src = renderer.domElement, W = src.width, H = src.height, k = W / (el.clientWidth || 1);
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const g = c.getContext("2d");
      g.drawImage(src, 0, 0);
      const box = el.getBoundingClientRect();
      const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
      for (const n of labelLayer.children) {
        if (n.style.display === "none") continue;
        const r = n.getBoundingClientRect();
        if (!r.width) continue;
        const x = (r.left - box.left) * k, y = (r.top - box.top) * k, w = r.width * k, h = r.height * k;
        const cs = getComputedStyle(n);
        if (n.tagName === "BUTTON") {
          // Map pin: same teardrop, tip at the bottom middle.
          const path = n.querySelector("path"), s = h / 36;
          g.save(); g.translate(x, y); g.scale(s, s);
          const pp = new Path2D(path.getAttribute("d"));
          g.fillStyle = getComputedStyle(path).fill; g.fill(pp);
          g.lineWidth = 2; g.strokeStyle = "#fff"; g.stroke(pp);
          g.fillStyle = "#fff"; g.font = "800 12px -apple-system, Helvetica, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic";
          g.fillText(n.dataset.pin || "", 14, 17.6);
          g.restore();
          continue;
        } else {
          rr(x, y, w, h, 7 * k); g.fillStyle = "rgba(255,255,255,0.9)"; g.fill();
        }
        g.fillStyle = cs.color;
        g.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px -apple-system, Helvetica, Arial, sans-serif`;
        g.textAlign = "center"; g.textBaseline = "middle";
        const lines = n.textContent.split("\n"), lh = parseFloat(cs.fontSize) * 1.2 * k;
        lines.forEach((t, i) => g.fillText(t, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * lh));
      }
      return c;
    },
    // A picture that turns slowly by itself (the job home), not a control.
    still: () => {
      still = true;
      controls.enabled = false;
      // Turning only when the phone's "Reduce Motion" is off.
      controls.autoRotate = !light && !(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); // light: a still picture
      controls.autoRotateSpeed = 0.7;
    },
    pause: (on) => { paused = !!on; dirty = true; },
    // Fly to one room (poly = its floor outline), looking from the same side;
    // null flies back to the whole place.
    focusRoom: (poly) => {
      let q1, dist;
      const vf = (camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect), f = Math.min(vf, hf);
      if (poly) {
        const xs = poly.map((p) => p[0]), zs = poly.map((p) => p[1]);
        const mx = (Math.min(...xs) + Math.max(...xs)) / 2, mz = (Math.min(...zs) + Math.max(...zs)) / 2;
        const r = Math.hypot((Math.max(...xs) - Math.min(...xs)) / 2, (Math.max(...zs) - Math.min(...zs)) / 2, topH / 2) + 0.2;
        q1 = new THREE.Vector3(mx - cx, topH * 0.3, mz - cz);
        dist = r / Math.sin(f / 2);
      } else {
        const r = Math.hypot((maxX - minX) / 2, (maxZ - minZ) / 2, topH / 2) + 0.3;
        q1 = target.clone();
        dist = r / Math.sin(f / 2);
      }
      const dir = camera.position.clone().sub(controls.target).normalize();
      if (dir.y < 0.45) { dir.y = 0.6; dir.normalize(); } // keep looking down into the room
      fly = { t0: performance.now(), p0: camera.position.clone(), q0: controls.target.clone(), p1: q1.clone().add(dir.multiplyScalar(dist)), q1 };
      dirty = true;
    },
    setPins,
    floorAt,
    clearPick: () => highlight(null),
    dispose: () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", onCtxLost);
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMoveP);
      renderer.domElement.removeEventListener("pointercancel", onCancelP);
      if (held) clearTimeout(held.timer);
      renderer.domElement.removeEventListener("pointerup", onUp);
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
      renderer.dispose();
      renderer.forceContextLoss(); // hand the GPU slot back now; iPhones allow only ~16 at once
      renderer.domElement.remove();
      labelLayer.remove();
    },
  };
}
