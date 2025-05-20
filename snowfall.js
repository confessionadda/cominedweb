// snowfall.js
(function() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let width, height;
  let flakes = [];

  function reset() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function createFlakes() {
    flakes = [];
    for (let i = 0; i < 100; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 4 + 1,
        d: Math.random() + 1,
        speed: Math.random() * 1 + 0.5
      });
    }
  }

  function drawFlakes() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
    }
    ctx.fill();
    moveFlakes();
  }

  let angle = 0;

  function moveFlakes() {
    angle += 0.01;
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y += f.speed;
      f.x += Math.sin(angle) * 0.5;

      if (f.y > height) {
        flakes[i] = {
          x: Math.random() * width,
          y: 0,
          r: f.r,
          d: f.d,
          speed: f.speed
        };
      }
    }
  }

  function loop() {
    drawFlakes();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    reset();
    createFlakes();
  });

  reset();
  createFlakes();
  loop();
})();
