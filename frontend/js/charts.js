// Minimal hand-rolled canvas line chart — no chart library, so the PWA
// offline shell never depends on a CDN and the stack stays vanilla JS.

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function fitCanvasToContainer(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = Math.max(rect.width, 200);
  const height = Math.max(rect.height, 140);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function formatShortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{labels: string[], series: {data:number[], color:string}[]}} config
 */
export function drawLineChart(canvas, config) {
  const { labels, series } = config;
  const { ctx, width, height } = fitCanvasToContainer(canvas);

  const padL = 32;
  const padR = 10;
  const padT = 14;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const textColor = cssVar("--text-muted", "#999");
  const gridColor = cssVar("--border", "rgba(255,255,255,0.1)");

  ctx.clearRect(0, 0, width, height);
  ctx.font = "10px system-ui, sans-serif";

  const allValues = series.flatMap((s) => s.data).filter((v) => typeof v === "number");
  if (allValues.length === 0) {
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText("No data", width / 2, height / 2);
    return;
  }

  let min = Math.min(...allValues);
  let max = Math.max(...allValues);
  if (min === max) {
    min -= 5;
    max += 5;
  }
  const rangePad = (max - min) * 0.15;
  min = Math.floor(min - rangePad);
  max = Math.ceil(max + rangePad);

  const n = labels.length;
  const xFor = (i) => padL + (n <= 1 ? plotW / 2 : (plotW * i) / (n - 1));
  const yFor = (v) => padT + plotH - ((v - min) / (max - min)) * plotH;

  // Grid lines (4 horizontal bands) + value labels
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const steps = 3;
  for (let i = 0; i <= steps; i++) {
    const v = min + ((max - min) * i) / steps;
    const y = yFor(v);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - padR, y);
    ctx.stroke();
    ctx.fillText(Math.round(v).toString(), 2, y);
  }

  // X-axis labels: first, middle, last
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const idxToShow = n <= 1 ? [0] : n === 2 ? [0, 1] : [0, Math.floor((n - 1) / 2), n - 1];
  idxToShow.forEach((i) => {
    if (labels[i] === undefined) return;
    ctx.fillText(labels[i], xFor(i), height - padB + 4);
  });

  // Series lines + points
  series.forEach((s) => {
    const pts = s.data.map((v, i) => ({ x: xFor(i), y: yFor(v), v }));
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    pts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    ctx.fillStyle = s.color;
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

export { formatShortDate };
