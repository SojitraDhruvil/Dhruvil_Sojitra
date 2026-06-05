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
const hoverTargets = 'a, button, .skill-tag, .project-card, .exp-item, .contact-card';
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

  const ACCENT = { r: 21, g: 128, b: 61 }; // Matching --accent (#15803d)

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -(Math.random() * 0.4 + 0.15);
      this.alpha = Math.random() * 0.3 + 0.05; // Fainter particles
      this.ox = this.x; this.oy = this.y;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
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
      ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

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
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(1 - d/90) * 0.04})`; // Subtler connection lines
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
