const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const countdown = document.getElementById("countdown");
const startSession = document.getElementById("startSession");
const download = document.getElementById("download");
const app = document.querySelector(".app");

const filterItems = document.querySelectorAll(".filter-item:not(.theme)");
const themeDots = document.querySelectorAll(".filter-item.theme");
const modeButtons = document.querySelectorAll(".mode-bar button");

let photos = [];
let shot = 0;
let currentFilter = "none";
let currentFrame = "none";
let currentMode = "strip";

/* Camera */
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

/* Filters */
filterItems.forEach(item => {
  item.onclick = () => {
    filterItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    currentFilter = item.dataset.filter;
    currentFrame = item.dataset.frame;

    video.style.filter = currentFilter;
    canvas.className = currentFrame !== "none" ? "frame-" + currentFrame : "";
  };
});

/* Themes */
themeDots.forEach(dot => {
  dot.onclick = () => {
    themeDots.forEach(d => d.classList.remove("active"));
    dot.classList.add("active");
    app.className = "app " + dot.dataset.theme;
  };
});

/* Modes – REAL TIME SWITCH */
modeButtons.forEach(btn => {
  btn.onclick = () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;

    if (photos.length === 4) buildOutput();
  };
});

/* Start session */
startSession.onclick = () => {
  photos = [];
  shot = 0;
  captureLoop();
};

/* Countdown + capture */
function captureLoop() {
  if (shot === 4) {
    buildOutput();
    return;
  }

  let count = 3;
  countdown.style.display = "flex";
  countdown.textContent = count;

  const timer = setInterval(() => {
    count--;
    countdown.textContent = count;

    if (count === 0) {
      clearInterval(timer);
      countdown.style.display = "none";
      capturePhoto();
      shot++;
      setTimeout(captureLoop, 1000);
    }
  }, 1000);
}

function capturePhoto() {
  const temp = document.createElement("canvas");
  temp.width = video.videoWidth;
  temp.height = video.videoHeight;
  const tctx = temp.getContext("2d");

  tctx.filter = currentFilter;
  tctx.drawImage(video, 0, 0);
  photos.push(temp.toDataURL());
}

/* BUILD OUTPUT */
function buildOutput() {
  canvas.style.display = "block";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let loaded = 0;
  const done = () => {
    loaded++;
    if (loaded === photos.length) {
      ctx.fillStyle = "#555";
      ctx.font = "14px Poppins";
      ctx.textAlign = "center";
      ctx.fillText(
        "Photobooth • " + new Date().toLocaleDateString(),
        canvas.width / 2,
        canvas.height - 10
      );
      download.href = canvas.toDataURL("image/png");
    }
  };

  /* STRIP */
  if (currentMode === "strip") {
    const w = 300, h = 220, gap = 18;
    canvas.width = w + gap * 2;
    canvas.height = h * 4 + gap * 5;
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    photos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, gap, gap + i * (h + gap), w, h);
        done();
      };
      img.src = src;
    });
  }

  /* POLAROID */
  if (currentMode === "polaroid") {
    const size = 260, gap = 24;
    canvas.width = size + gap * 2;
    canvas.height = (size + 70) * 4 + gap;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    photos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        const y = gap + i * (size + 70);
        ctx.fillStyle = "#fff";
        ctx.fillRect(gap, y, size, size + 50);
        ctx.drawImage(img, gap + 10, y + 10, size - 20, size - 20);
        done();
      };
      img.src = src;
    });
  }

  /* SQUARE */
  if (currentMode === "square") {
    const size = 190, gap = 16;
    canvas.width = size * 2 + gap * 3;
    canvas.height = size * 2 + gap * 3;
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    photos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        const x = gap + (i % 2) * (size + gap);
        const y = gap + Math.floor(i / 2) * (size + gap);
        ctx.drawImage(img, x, y, size, size);
        done();
      };
      img.src = src;
    });
  }
}
