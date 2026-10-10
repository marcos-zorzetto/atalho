/**
 * Aurora de luz em WebGL puro (sem bibliotecas, ~3 KB): faixas de cor que
 * ondulam devagar, como as auroras das páginas de produto. Pausa fora do ecrã.
 */
const VERTICE = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAGMENTO = `
precision highp float;
uniform vec2 tamanho;
uniform float tempo;
uniform vec3 cor1;
uniform vec3 cor2;
uniform vec3 cor3;

// Ruído suave (value noise) para as ondas
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float camadas(vec2 p) {
  float v = 0.0, amp = 0.55;
  for (int i = 0; i < 5; i++) { v += amp * ruido(p); p *= 2.02; amp *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / tamanho;
  vec2 p = vec2(uv.x * tamanho.x / tamanho.y, uv.y);
  float t = tempo * 0.06;
  float n = camadas(vec2(p.x * 1.4 + t, p.y * 0.6 - t * 0.5));
  // Três faixas de luz que sobem e descem ao longo do eixo X
  float f1 = smoothstep(0.32, 0.0, abs(uv.y - 0.62 - 0.14 * sin(p.x * 2.1 + t * 6.0) - (n - 0.5) * 0.35));
  float f2 = smoothstep(0.28, 0.0, abs(uv.y - 0.48 - 0.12 * sin(p.x * 1.7 - t * 5.0 + 1.3) - (n - 0.5) * 0.4));
  float f3 = smoothstep(0.24, 0.0, abs(uv.y - 0.36 - 0.1 * sin(p.x * 2.6 + t * 4.0 + 2.1) - (n - 0.5) * 0.3));
  vec3 cor = cor1 * f1 * 0.9 + cor2 * f2 * 0.75 + cor3 * f3 * 0.6;
  // Estrelas finas
  float estrela = step(0.9975, ruido(gl_FragCoord.xy * 0.35)) * (0.5 + 0.5 * sin(tempo * 2.0 + gl_FragCoord.x));
  cor += vec3(estrela) * 0.6 * (1.0 - uv.y * 0.5);
  gl_FragColor = vec4(cor * (0.65 + 0.35 * n), 1.0);
}`;

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ cores?: [string, string, string], velocidade?: number }} [opcoes]
 */
export function iniciarAurora(canvas, { cores = ["#ffc53d", "#14b8a6", "#7c3aed"], velocidade = 1 } = {}) {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return { parar() {} };
  const compilar = (tipo, fonte) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    return s;
  };
  const programa = gl.createProgram();
  gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTICE));
  gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENTO));
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return { parar() {} };
  gl.useProgram(programa);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const p = gl.getAttribLocation(programa, "p");
  gl.enableVertexAttribArray(p);
  gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

  const u = (n) => gl.getUniformLocation(programa, n);
  const uTamanho = u("tamanho"), uTempo = u("tempo");
  gl.uniform3fv(u("cor1"), rgb(cores[0]));
  gl.uniform3fv(u("cor2"), rgb(cores[1]));
  gl.uniform3fv(u("cor3"), rgb(cores[2]));

  // Aurora é suave por natureza: meia resolução chega e poupa a placa gráfica
  const ajustar = () => {
    const escala = Math.min(devicePixelRatio, 2) * 0.5;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * escala));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * escala));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uTamanho, canvas.width, canvas.height);
  };
  const observador = new ResizeObserver(ajustar);
  observador.observe(canvas);
  ajustar();

  let pedido = 0, visivel = false;
  const inicio = performance.now();
  const quadro = (agora) => {
    pedido = requestAnimationFrame(quadro);
    gl.uniform1f(uTempo, ((agora - inicio) / 1000) * velocidade);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const ligar = () => { if (!pedido && visivel && !document.hidden) pedido = requestAnimationFrame(quadro); };
  const desligar = () => { cancelAnimationFrame(pedido); pedido = 0; };
  const vista = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; visivel ? ligar() : desligar(); });
  vista.observe(canvas);
  const aoEsconder = () => (document.hidden ? desligar() : ligar());
  document.addEventListener("visibilitychange", aoEsconder);

  return {
    parar() {
      desligar();
      vista.disconnect();
      observador.disconnect();
      document.removeEventListener("visibilitychange", aoEsconder);
    },
  };
}
