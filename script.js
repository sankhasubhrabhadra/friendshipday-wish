/* ==========================================================================
   INTERACTIVE LOGIC, STATE MACHINE, SOUNDS & PARTICLES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------
  // 1. Web Audio API Sound Synthesizer Engine
  // --------------------------------------------------
  let audioCtx = null;
  let isMuted = false;
  let bgmInterval = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play Sound Effects (synthesized cute chimes & pops)
  function playSound(type) {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'anger') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'happy') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.2, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.25);
      });
    }
  }

  // Cute Background Melodic Chiptune Engine
  function startBGM() {
    if (bgmInterval || isMuted) return;
    initAudio();
    
    const melody = [
      { f: 523.25, d: 0.2 }, { f: 659.25, d: 0.2 }, { f: 783.99, d: 0.2 }, { f: 659.25, d: 0.2 },
      { f: 587.33, d: 0.2 }, { f: 698.46, d: 0.2 }, { f: 880.00, d: 0.2 }, { f: 698.46, d: 0.2 }
    ];
    let noteIdx = 0;

    bgmInterval = setInterval(() => {
      if (isMuted || !audioCtx) return;
      const note = melody[noteIdx % melody.length];
      noteIdx++;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + note.d);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + note.d);
    }, 450);
  }

  function stopBGM() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }

  // Sound Toggle Control
  const musicToggleBtn = document.getElementById('musicToggle');
  const musicIconEl = document.getElementById('musicIcon');
  const musicTextEl = document.getElementById('musicText');

  musicToggleBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      musicIconEl.textContent = '🔇';
      musicTextEl.textContent = 'Muted';
      stopBGM();
    } else {
      musicIconEl.textContent = '🎵';
      musicTextEl.textContent = 'Sound On';
      startBGM();
      playSound('happy');
    }
  });

  // Start background audio on first user touch / click anywhere
  document.body.addEventListener('click', () => {
    if (!isMuted && !bgmInterval) {
      startBGM();
    }
  }, { once: true });


  // --------------------------------------------------
  // 2. Gatekeeper State Machine Logic
  // --------------------------------------------------
  const stages = {
    init: document.getElementById('stage-init'),
    no1: document.getElementById('stage-no-1'),
    no2: document.getElementById('stage-no-2'),
    no3: document.getElementById('stage-no-3'),
    yesReveal: document.getElementById('stage-yes-reveal')
  };

  function switchStage(currentStageEl, targetStageEl) {
    currentStageEl.classList.remove('active-stage');
    setTimeout(() => {
      targetStageEl.classList.add('active-stage');
    }, 200);
  }

  // YES Buttons Logic -> Leads directly to Happy Reveal Stage!
  const yesButtons = [
    document.getElementById('btnYesInit'),
    document.getElementById('btnBackToYes1'),
    document.getElementById('btnBackToYes2'),
    document.getElementById('btnBackToYes3')
  ];

  yesButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        playSound('happy');
        const activeStage = document.querySelector('.stage.active-stage');
        switchStage(activeStage, stages.yesReveal);
        triggerConfetti(0.4);
      });
    }
  });

  // NO Buttons Progressive Anger Logic
  const btnNo1 = document.getElementById('btnNo1');
  const btnNo2 = document.getElementById('btnNo2');
  const btnNo3 = document.getElementById('btnNo3');
  const btnNoDodger = document.getElementById('btnNoDodger');

  if (btnNo1) {
    btnNo1.addEventListener('click', () => {
      playSound('anger');
      switchStage(stages.init, stages.no1);
    });
  }

  if (btnNo2) {
    btnNo2.addEventListener('click', () => {
      playSound('anger');
      switchStage(stages.no1, stages.no2);
    });
  }

  if (btnNo3) {
    btnNo3.addEventListener('click', () => {
      playSound('anger');
      switchStage(stages.no2, stages.no3);
    });
  }

  // Dodging / Runaway "No" Button on Stage 3
  if (btnNoDodger) {
    const runAway = () => {
      playSound('pop');
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 150;
      btnNoDodger.style.transform = `translate(${x}px, ${y}px) scale(0.8)`;
    };
    btnNoDodger.addEventListener('mouseenter', runAway);
    btnNoDodger.addEventListener('touchstart', runAway);
    btnNoDodger.addEventListener('click', runAway);
  }

  // Start Gift Button -> Reveal Slides Deck!
  const btnStartGift = document.getElementById('btnStartGift');
  const gatekeeperCard = document.getElementById('gatekeeperCard');
  const slidesCard = document.getElementById('slidesCard');

  if (btnStartGift) {
    btnStartGift.addEventListener('click', () => {
      playSound('happy');
      gatekeeperCard.classList.remove('active-card');
      gatekeeperCard.classList.add('hidden-card');

      setTimeout(() => {
        slidesCard.classList.remove('hidden-card');
        slidesCard.classList.add('active-card');
        triggerConfetti(0.8);
      }, 400);
    });
  }


  // --------------------------------------------------
  // 3. Multi-Slide Navigation Logic
  // --------------------------------------------------
  let currentSlide = 0;
  const slideElements = document.querySelectorAll('.slide-content');
  const dotElements = document.querySelectorAll('.dot');
  const nextSlideButtons = document.querySelectorAll('.btn-next-slide');
  const btnReplay = document.getElementById('btnReplay');

  function goToSlide(index) {
    if (index < 0 || index >= slideElements.length) return;
    playSound('pop');

    slideElements[currentSlide].classList.remove('active-slide');
    dotElements[currentSlide].classList.remove('active-dot');

    currentSlide = index;

    setTimeout(() => {
      slideElements[currentSlide].classList.add('active-slide');
      dotElements[currentSlide].classList.add('active-dot');

      if (currentSlide === slideElements.length - 1) {
        triggerConfetti(1.0);
      }
    }, 200);
  }

  nextSlideButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });
  });

  dotElements.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIdx = parseInt(dot.getAttribute('data-slide'));
      goToSlide(slideIdx);
    });
  });

  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      goToSlide(0);
    });
  }


  // --------------------------------------------------
  // 4. Confetti Burst Helper
  // --------------------------------------------------
  function triggerConfetti(intensity = 0.5) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: Math.floor(60 * intensity),
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff85a2', '#40c080', '#a07cf8', '#ffb830']
      });
    }
  }


  // --------------------------------------------------
  // 5. Background Floating Particle Canvas Engine
  // --------------------------------------------------
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleColors = ['#ff85a2', '#a07cf8', '#ffb830', '#40c080', '#ffa8ba'];

  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 8 + 4,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      vx: (Math.random() - 0.5) * 0.6,
      vy: -Math.random() * 0.8 - 0.2,
      opacity: Math.random() * 0.5 + 0.3
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });

    requestAnimationFrame(renderParticles);
  }

  renderParticles();

});
