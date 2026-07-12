// ─── CUSTOM CURSOR ───
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

function animateCursor() {
  if (dot && ring) {
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Custom cursor hover states
const hoverTargets = 'a, button, .skill-tag, .project-card, .exp-item, .edu-item, .contact-row';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// ─── AMBIENT GLOW ───
const ambient = document.getElementById('ambient-light');
document.addEventListener('mousemove', e => {
  if (ambient) {
    ambient.style.setProperty('--mouse-x', `${e.clientX}px`);
    ambient.style.setProperty('--mouse-y', `${e.clientY}px`);
  }
});

// ─── MAGNETIC EFFECT on buttons ───
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) * 0.3;
    const dy = (e.clientY - cy) * 0.3;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ─── PARTICLES ───
const canvas = document.getElementById('particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let ACCENT = { r: 21, g: 128, b: 61 }; // Matching --accent (#15803d)

  window.updateParticleAccent = function() {
    const style = getComputedStyle(document.documentElement);
    const rgbStr = style.getPropertyValue('--accent-rgb').trim();
    if (rgbStr) {
      const parts = rgbStr.split(',').map(Number);
      if (parts.length === 3) {
        ACCENT.r = parts[0];
        ACCENT.g = parts[1];
        ACCENT.b = parts[2];
      }
    }
  };
  window.updateParticleAccent();

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      // Initialize with a gradient (more bubbles at the bottom)
      this.y = init ? H * Math.pow(Math.random(), 0.6) : H + 10;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -(Math.random() * 0.4 + 0.15);
      this.alpha = Math.random() * 0.3 + 0.05; // Soft base alpha
      this.ox = this.x; this.oy = this.y;
      this.life = 0;
      
      // Calculate maxLife based on screen height and speed so particles can reach the top,
      // but some die earlier to create a density gradient.
      const travelTime = H / Math.abs(this.speedY);
      this.maxLife = travelTime * (Math.random() * 1.2 + 0.2);
    }
    update(mouseX, mouseY) {
      this.life++;
      const dx = this.x - mouseX, dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += dx / dist * force * 1.8;
        this.y += dy / dist * force * 1.8;
      } else {
        this.x += (this.ox - this.x) * 0.02 + this.speedX;
        this.y += (this.oy - this.y) * 0.02 + this.speedY;
      }
      this.ox += this.speedX * 0.5;
      this.oy += this.speedY * 0.5;
      if (this.oy < -10 || this.life > this.maxLife) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      // Fade out alpha as it goes higher (lower y coordinate)
      const progress = Math.max(0, Math.min(1, this.y / H));
      const currentAlpha = this.alpha * (0.2 + 0.8 * progress);
      ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${currentAlpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Particle());

  let pmx = -999, pmy = -999;
  document.addEventListener('mousemove', e => { pmx = e.clientX; pmy = e.clientY; });

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(pmx, pmy); p.draw(); });
    // draw faint connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          const avgY = (particles[i].y + particles[j].y) / 2;
          const progress = Math.max(0, Math.min(1, avgY / H));
          const lineAlpha = (1 - d/90) * 0.04 * (0.2 + 0.8 * progress);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${lineAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ─── SCROLL SPY & REVEAL ───
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });
}, {
  rootMargin: '-20% 0px -60% 0px'
});

sections.forEach(s => spyObserver.observe(s));

// Reveal sections on scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

sections.forEach(s => {
  s.style.opacity = '0';
  s.style.transform = 'translateY(24px)';
  s.style.transition = 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
  revealObserver.observe(s);
});

// ─── THEME TOGGLE ───
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (typeof window.updateParticleAccent === 'function') {
      window.updateParticleAccent();
    }
  });
}

// ─── PROJECTS AUTO-SCROLL & DRAG ───
(function () {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  // Clone all children of projects-grid for infinite circular scrolling
  const children = Array.from(grid.children);
  children.forEach(child => {
    const clone = child.cloneNode(true);
    grid.appendChild(clone);
  });

  let isPaused = false;
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let moved = false;
  let scrollSpeed = 0.6; // Speed in pixels per frame (smooth slow scroll)
  let currentScroll = 0; // Float variable to track subpixel positions precisely

  // Disable scroll snapping dynamically for fluid continuous scrolling
  grid.style.scrollSnapType = 'none';

  const handleScrollWrap = () => {
    // Exact loop point matches half the scrollable content plus gap offset
    const loopPoint = (grid.scrollWidth + 1) / 2;
    if (grid.scrollLeft >= loopPoint) {
      grid.scrollLeft -= loopPoint;
      currentScroll = grid.scrollLeft;
    } else if (grid.scrollLeft < 0) {
      grid.scrollLeft += loopPoint;
      currentScroll = grid.scrollLeft;
    }
  };

  // Continuous animation frame loop
  const updateScroll = () => {
    if (!isPaused && !isDown) {
      currentScroll += scrollSpeed;
      handleScrollWrap();
      grid.scrollLeft = Math.round(currentScroll);
    }
    requestAnimationFrame(updateScroll);
  };
  
  // Start the continuous scrolling loop
  requestAnimationFrame(updateScroll);

  // Monitor scroll for manual wraps (trackpad / mouse wheel) and keep float in sync
  grid.addEventListener('scroll', () => {
    handleScrollWrap();
    currentScroll = grid.scrollLeft;
  });

  // Pause on hover
  grid.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  grid.addEventListener('mouseleave', () => {
    isPaused = false;
  });

  // Pause on touch (mobile devices)
  grid.addEventListener('touchstart', () => {
    isPaused = true;
  }, { passive: true });

  grid.addEventListener('touchend', () => {
    isPaused = false;
  }, { passive: true });

  // Drag-to-Scroll logic (desktop mouse dragging)
  grid.addEventListener('mousedown', (e) => {
    isDown = true;
    grid.style.scrollBehavior = 'auto'; // Instant drag response
    startX = e.pageX - grid.offsetLeft;
    scrollLeft = grid.scrollLeft;
    moved = false;
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
  });

  grid.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - grid.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    if (Math.abs(walk) > 7) {
      moved = true;
    }
    grid.scrollLeft = scrollLeft - walk;
    handleScrollWrap();
    currentScroll = grid.scrollLeft;
  });

  // Prevent link navigation if drag occurred
  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
      }
    });
  });
})();

