const state = {
  audioEnabled: true,
  introStarted: false,
  introPlayed: sessionStorage.getItem("qera_intro_played") === "1",
  waitingForGesture: true,
};

const audio = {
  intro: null,
  hum: null,
};

const volumes = {
  introBase: 0.85,
  hum: 0.08,
};

function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const particles = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const create = () => {
    particles.length = 0;
    const count = window.innerWidth < 720 ? 60 : 110;
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.2 + 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.fillStyle = `rgba(122, 245, 255, ${p.opacity})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  create();
  draw();
  window.addEventListener("resize", () => {
    resize();
    create();
  });
}

function initAudio() {
  audio.intro = new Audio("welcome-qera.mp3");
  audio.intro.preload = "auto";
  audio.intro.loop = false;
  audio.intro.volume = volumes.introBase;

  audio.hum = new Audio("assets/sfx-hover.mp3");
  audio.hum.loop = true;
  audio.hum.volume = volumes.hum;
}

function updateToggleUI() {
  const toggle = document.getElementById("sound-toggle");
  const icon = toggle.querySelector(".sound-icon");
  const label = toggle.querySelector(".sound-label");
  toggle.classList.toggle("muted", !state.audioEnabled);
  toggle.setAttribute("aria-pressed", state.audioEnabled ? "true" : "false");
  icon.textContent = state.audioEnabled ? "🔊" : "🔇";
  label.textContent = state.audioEnabled ? "Sound On" : "Sound Off";
}

function showBootOverlay(active) {
  const overlay = document.querySelector(".boot-overlay");
  if (!overlay) return;
  overlay.classList.toggle("active", active);
}

function pulseBrand(active) {
  const brand = document.querySelector(".brand");
  if (!brand) return;
  brand.classList.toggle("pulse", active);
}

function fadeIntroOnScroll() {
  if (!audio.intro || audio.intro.paused) return;
  const fade = Math.max(0, 1 - window.scrollY / 700);
  audio.intro.volume = Math.min(volumes.introBase, volumes.introBase * fade);
  if (fade <= 0.05) {
    showBootOverlay(false);
    pulseBrand(false);
  }
}

function startHum() {
  if (!audio.hum || !state.audioEnabled) return;
  audio.hum.currentTime = 0;
  audio.hum.play().catch(() => {
    // hum will wait for interaction
  });
}

function playIntro() {
  if (!state.audioEnabled || state.introStarted || state.introPlayed) {
    startHum();
    return;
  }
  state.introStarted = true;
  audio.intro.currentTime = 0;
  audio.intro.volume = volumes.introBase;
  showBootOverlay(true);
  pulseBrand(true);
  audio.intro
    .play()
    .then(() => {
      state.introPlayed = true;
      sessionStorage.setItem("qera_intro_played", "1");
    })
    .catch(() => {
      state.introStarted = false;
    });
}

function wireAudio() {
  const toggle = document.getElementById("sound-toggle");

  ["click", "touchstart"].forEach((evt) => {
    document.addEventListener(
      evt,
      () => {
        state.waitingForGesture = false;
        if (!state.audioEnabled) return;
        if (!state.introPlayed) {
          playIntro();
        } else {
          startHum();
        }
      },
      { once: true, passive: true }
    );
  });

  window.addEventListener("scroll", fadeIntroOnScroll, { passive: true });

  audio.intro.addEventListener("ended", () => {
    showBootOverlay(false);
    pulseBrand(false);
    startHum();
  });

  toggle.addEventListener("click", () => {
    state.audioEnabled = !state.audioEnabled;
    updateToggleUI();
    if (state.audioEnabled) {
      if (state.introPlayed) {
        startHum();
      } else {
        playIntro();
      }
    } else {
      if (audio.intro) audio.intro.pause();
      if (audio.hum) audio.hum.pause();
      showBootOverlay(false);
      pulseBrand(false);
    }
  });

  updateToggleUI();
}

function initStats() {
  const latencyEl = document.querySelector('[data-stat="latency"]');
  const memoryEl = document.querySelector('[data-stat="memory"]');
  const bridgesEl = document.querySelector('[data-stat="bridges"]');
  if (!latencyEl || !memoryEl || !bridgesEl) return;

  const update = () => {
    const latency = (Math.random() * 0.35 + 0.12).toFixed(2);
    const memory = Math.floor(Math.random() * 32) + 120;
    const bridges = String(Math.floor(Math.random() * 5) + 7).padStart(2, "0");
    latencyEl.textContent = `${latency} ms`;
    memoryEl.textContent = memory.toString();
    bridgesEl.textContent = bridges;
  };
  update();
  setInterval(update, 2400);
}

document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initAudio();
  wireAudio();
  initStats();

  const vid = document.getElementById("humanoidVid");
  const fallback = document.getElementById("fallbackAI");
  if (vid && fallback) {
    vid.addEventListener("error", () => {
      vid.style.display = "none";
      fallback.style.display = "block";
    });

    vid.addEventListener("loadeddata", () => {
      fallback.style.display = "none";
    });
  }
});
