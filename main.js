(function () {
  'use strict';

  /* ============================================================
     THREE.JS — CINEMATIC 3D SCULPTURE
     ============================================================ */
  const canvas = document.getElementById('hero-canvas');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x09090e, 0.048);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 6.5);

  /* ---- Main Sculpture ---- */
  const knotGeo = new THREE.TorusKnotGeometry(1.45, 0.44, 280, 36, 3, 2);
  const knotMat = new THREE.MeshPhongMaterial({
    color:     0x060c1e,
    emissive:  0x010308,
    specular:  0x2255cc,
    shininess: 480,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  /* ---- Wireframe Shell ---- */
  const wireGeo = new THREE.TorusKnotGeometry(1.47, 0.45, 140, 18, 3, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x3388ff, wireframe: true, transparent: true, opacity: 0.08,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  /* ---- Orbit Rings ---- */
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.018, 4, 160),
    new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.18 })
  );
  ring.rotation.x = Math.PI * 0.3;
  scene.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.012, 4, 160),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.12 })
  );
  ring2.rotation.x = Math.PI * 0.55;
  ring2.rotation.z = Math.PI * 0.2;
  scene.add(ring2);

  /* ---- Particle Field ---- */
  const PARTICLE_COUNT = 4000;
  const pPos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 2.8 + Math.pow(Math.random(), 0.6) * 4.2;
    pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x6699bb, size: 0.038, transparent: true, opacity: 0.55, sizeAttenuation: true,
  }));
  scene.add(particles);

  /* ---- Cinematic Lighting Rig ---- */
  scene.add(new THREE.AmbientLight(0x04040f, 2));
  const rimBlue = new THREE.PointLight(0x1155ee, 10, 18);
  rimBlue.position.set(-5, 3, -3.5);
  scene.add(rimBlue);
  const rimPurple = new THREE.PointLight(0x7722cc, 8, 14);
  rimPurple.position.set(5, -2.5, -2.5);
  scene.add(rimPurple);
  const topCyan = new THREE.PointLight(0x00ccff, 4, 12);
  topCyan.position.set(0, 6, 2);
  scene.add(topCyan);
  const bottomWarm = new THREE.PointLight(0xff4400, 2, 10);
  bottomWarm.position.set(1.5, -5, 2);
  scene.add(bottomWarm);
  scene.add(new THREE.PointLight(0xffffff, 0.8, 20)).position.set(0, 0, 8);

  /* ---- Mouse Tracking ---- */
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  window.addEventListener('mousemove', function (e) {
    targetRotX = (e.clientY / window.innerHeight - 0.5) *  0.6;
    targetRotY = (e.clientX / window.innerWidth  - 0.5) *  1.0;
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    const t = e.touches[0];
    targetRotX = (t.clientY / window.innerHeight - 0.5) * 0.5;
    targetRotY = (t.clientX / window.innerWidth  - 0.5) * 0.8;
  }, { passive: true });

  /* ---- Resize ---- */
  function resizeToClient() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width === w && canvas.height === h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ---- Animation Loop ---- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    resizeToClient();

    const t = clock.getElapsedTime();

    currentRotX += (targetRotX - currentRotX) * 0.04;
    currentRotY += (targetRotY - currentRotY) * 0.04;

    knot.rotation.x = t * 0.12 + currentRotX * 0.7;
    knot.rotation.y = t * 0.18 + currentRotY * 1.1;
    wire.rotation.x = knot.rotation.x;
    wire.rotation.y = knot.rotation.y;

    ring.rotation.z  =  t * 0.06;
    ring2.rotation.z = -t * 0.04 + currentRotX * 0.3;
    ring2.rotation.y =  t * 0.05 + currentRotY * 0.2;

    particles.rotation.y = t * 0.025;
    particles.rotation.x = t * 0.008 + currentRotX * 0.15;

    camera.position.x = currentRotY * 0.25;
    camera.position.y = -currentRotX * 0.18;

    // Scroll-driven vertical drift
    const drift = window.scrollY * 0.002;
    knot.position.y = -drift;
    wire.position.y = -drift;
    camera.lookAt(0, -drift * 0.3, 0);

    // Animated rim light orbit
    rimBlue.position.x = Math.sin(t * 0.4) * 5 - 2;
    rimBlue.position.z = Math.cos(t * 0.4) * 3 - 3;

    renderer.render(scene, camera);
  }

  renderer.setSize(
    canvas.clientWidth  || window.innerWidth,
    canvas.clientHeight || window.innerHeight,
    false
  );
  camera.aspect = (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight);
  camera.updateProjectionMatrix();
  animate();

  /* ============================================================
     PARALLAX SYSTEM
     Multi-layer scroll parallax with rAF batching
     ============================================================ */
  const heroContent  = document.getElementById('hero-content');
  const heroHeading  = document.getElementById('hero-heading');
  const heroEyebrow  = document.getElementById('hero-eyebrow');
  const heroSub      = document.getElementById('hero-sub');
  const heroForm     = document.getElementById('hero-form');
  const heroHeight   = function () { return document.querySelector('.hero').offsetHeight; };

  // Elements with [data-depth] attribute — section-level parallax
  const depthEls = document.querySelectorAll('[data-depth]');

  let lastScrollY = -1;
  let rafId = null;

  function applyParallax() {
    const sy = window.scrollY;

    // Hero layers — only active while hero is in view
    if (sy <= heroHeight()) {
      // Each layer moves at a different rate creating depth separation
      if (heroEyebrow) heroEyebrow.style.transform = 'translate3d(0,' + (sy * 0.55) + 'px,0)';
      if (heroHeading) heroHeading.style.transform  = 'translate3d(0,' + (sy * 0.42) + 'px,0)';
      if (heroSub)     heroSub.style.transform      = 'translate3d(0,' + (sy * 0.32) + 'px,0)';
      if (heroForm)    heroForm.style.transform     = 'translate3d(0,' + (sy * 0.22) + 'px,0)';
    }

    // Section-level parallax: each element drifts relative to its viewport center offset
    depthEls.forEach(function (el) {
      const depth = parseFloat(el.dataset.depth) || 0.08;
      const rect  = el.getBoundingClientRect();
      // Skip offscreen elements
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const centerOffset = (rect.top + rect.height / 2) - window.innerHeight * 0.5;
      el.style.transform = 'translate3d(0,' + (centerOffset * depth * -1) + 'px,0)';
    });

    rafId = null;
  }

  window.addEventListener('scroll', function () {
    if (window.scrollY === lastScrollY) return;
    lastScrollY = window.scrollY;
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  }, { passive: true });

  // Run once on load
  applyParallax();

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ============================================================
     NAV SCROLL EFFECT
     ============================================================ */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ============================================================
     PROJECT IMAGE PARALLAX (deeper shift for mockup visuals)
     ============================================================ */
  const parallaxImgEls = document.querySelectorAll('[data-parallax-img]');

  const imgObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const speed = parseFloat(el.dataset.parallaxImg) || 0.1;

      function shiftImg() {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const offset   = (progress - 0.5) * speed * 300;
        el.style.transform = 'translate3d(0,' + offset + 'px,0)';
      }

      window.addEventListener('scroll', shiftImg, { passive: true });
      shiftImg();
    });
  }, { threshold: 0 });

  parallaxImgEls.forEach(function (el) { imgObserver.observe(el); });

  /* ============================================================
     ACCORDION
     ============================================================ */
  document.querySelectorAll('.acc-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = trigger.closest('.acc-item');
      const isOpen = item.classList.contains('acc-item--open');
      // Close all
      document.querySelectorAll('.acc-item').forEach(function (i) {
        i.classList.remove('acc-item--open');
      });
      // Toggle clicked
      if (!isOpen) item.classList.add('acc-item--open');
    });
  });

  /* ============================================================
     HERO FORM SUBMIT
     ============================================================ */
  document.getElementById('hero-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = this.querySelector('.hero-cta');
    btn.textContent = 'Sending…';
    setTimeout(function () {
      btn.textContent = 'Sent! Talk soon.';
      btn.style.background = '#4ade80';
      setTimeout(function () {
        btn.textContent = 'Let\'s Build Something';
        btn.style.background = '';
      }, 3000);
    }, 1000);
  });

  /* ============================================================
     CONTACT FORM SUBMIT
     ============================================================ */
  const contactForm   = document.getElementById('contact-form');
  const contactSubmit = document.getElementById('contact-submit');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      contactSubmit.textContent = 'Sending…';
      contactSubmit.disabled    = true;
      setTimeout(function () {
        contactSubmit.textContent      = 'Message Sent';
        contactSubmit.style.background = '#22c55e';
        contactSubmit.style.color      = '#000';
        contactForm.reset();
        setTimeout(function () {
          contactSubmit.textContent      = 'Send Message';
          contactSubmit.style.background = '';
          contactSubmit.style.color      = '';
          contactSubmit.disabled         = false;
        }, 3000);
      }, 1200);
    });
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mx = -100, my = -100, fx = -100, fy = -100;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  }, { passive: true });

  (function loopFollower() {
    requestAnimationFrame(loopFollower);
    fx += (mx - fx) * 0.11;
    fy += (my - fy) * 0.11;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
  })();

  document.querySelectorAll('a, button, .exp-card, .acc-trigger, .form-input, .tech-item').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      cursor.classList.add('is-hovering');
      follower.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-hovering');
      follower.classList.remove('is-hovering');
    });
  });

  document.addEventListener('mouseleave', function () {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    cursor.style.opacity   = '1';
    follower.style.opacity = '1';
  });

  /* ============================================================
     ACTIVE NAV SECTION TRACKING
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');

  new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-social-link').forEach(function (l) {
          l.classList.remove('is-active');
        });
      }
    });
  }, { threshold: 0.4 }).observe(document.querySelector('.hero') || document.body);

  /* ============================================================
     TECH TICKER — pause on hover (CSS handles animation,
     JS just wires the data attribute for pause)
     ============================================================ */
  // handled purely in CSS via animation-play-state

})();
