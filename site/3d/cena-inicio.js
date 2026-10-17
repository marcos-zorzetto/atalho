/**
 * Cena 3D da página inicial: a tecla do Atalho em ouro, rodeada de painéis de
 * vidro com interfaces reais (encomenda paga, gráfico, formulário…).
 *
 * - Materiais PBR com reflexos de estúdio (RoomEnvironment), sem ficheiros externos.
 * - Renderiza na resolução do ecrã (até 2x): nítida em ecrãs 4K e Retina.
 * - Reage ao rato e ao scroll; pausa fora do ecrã e com o separador escondido.
 * - Telemóveis e placas fracas recebem uma versão mais leve (sem refração).
 *
 * Empacotada com o esbuild (scripts/gerar-site.mjs): só entra o que é usado do Three.js.
 */
import {
  ACESFilmicToneMapping, AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, DirectionalLight,
  ExtrudeGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PMREMGenerator,
  PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Scene, Shape, SRGBColorSpace, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const OURO = new Color("#ffc53d");
const FONTE = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/* ------------------------------------------------------------------------
   Texturas das interfaces (desenhadas em canvas, nítidas a 2048 px)
   ------------------------------------------------------------------------ */

function canvasUI(largura = 1024, altura = 672) {
  const c = document.createElement("canvas");
  c.width = largura * 2;
  c.height = altura * 2;
  const g = c.getContext("2d");
  g.scale(2, 2);
  return { c, g, largura, altura };
}

function cartao(g, l, a, cor = "rgba(255,255,255,0.94)") {
  g.fillStyle = cor;
  g.beginPath();
  g.roundRect(0, 0, l, a, 48);
  g.fill();
}

function texto(g, t, x, y, tamanho, peso = 600, cor = "#1c1917") {
  g.fillStyle = cor;
  g.font = `${peso} ${tamanho}px ${FONTE}`;
  g.fillText(t, x, y);
}

function pilula(g, x, y, l, a, cor) {
  g.fillStyle = cor;
  g.beginPath();
  g.roundRect(x, y, l, a, a / 2);
  g.fill();
}

const DESENHOS = [
  // Encomenda paga
  ({ g, largura: l, altura: a }) => {
    cartao(g, l, a);
    g.fillStyle = "#dcfce7";
    g.beginPath(); g.arc(130, 170, 62, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#16a34a"; g.lineWidth = 14; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(102, 172); g.lineTo(124, 194); g.lineTo(162, 150); g.stroke();
    texto(g, "Encomenda #1052", 230, 158, 50, 700);
    texto(g, "Paga com MB WAY · agora", 230, 212, 34, 500, "#57534e");
    g.fillStyle = "#f5f5f4"; g.beginPath(); g.roundRect(64, 300, l - 128, 1, 0); g.fill();
    texto(g, "Total", 64, 400, 36, 500, "#57534e");
    texto(g, "189,90 €", l - 300, 404, 62, 800);
    pilula(g, 64, 480, l - 128, 110, "#0f766e");
    texto(g, "Ver encomenda", l / 2 - 140, 550, 40, 700, "#fff");
  },
  // Gráfico de vendas
  ({ g, largura: l, altura: a }) => {
    cartao(g, l, a);
    texto(g, "Vendas · outubro", 64, 110, 38, 600, "#57534e");
    texto(g, "24 680 €", 64, 190, 76, 800);
    pilula(g, 420, 140, 150, 56, "#dcfce7");
    texto(g, "+18%", 448, 180, 32, 700, "#16a34a");
    const barras = [0.35, 0.5, 0.42, 0.62, 0.55, 0.78, 0.7, 0.92];
    barras.forEach((v, i) => {
      const x = 64 + i * ((l - 128) / barras.length), larg = (l - 128) / barras.length - 22, alt = v * 330;
      const grad = g.createLinearGradient(0, a - 60 - alt, 0, a - 60);
      grad.addColorStop(0, i === barras.length - 1 ? "#f59e0b" : "#0f766e");
      grad.addColorStop(1, i === barras.length - 1 ? "#fde68a" : "#99f6e4");
      g.fillStyle = grad;
      g.beginPath(); g.roundRect(x, a - 60 - alt, larg, alt, 14); g.fill();
    });
  },
  // Formulário com NIF e código postal
  ({ g, largura: l }) => {
    cartao(g, l, 672);
    const campo = (y, rotulo, valor, ok) => {
      texto(g, rotulo, 64, y, 32, 600, "#57534e");
      g.strokeStyle = ok ? "#16a34a" : "#d6d3d1"; g.lineWidth = 4;
      g.beginPath(); g.roundRect(64, y + 22, l - 128, 108, 22); g.stroke();
      texto(g, valor, 96, y + 92, 44, 600);
      if (ok) texto(g, "✓", l - 130, y + 94, 48, 800, "#16a34a");
    };
    campo(90, "NIF", "123 456 789", true);
    campo(290, "Código postal", "1250-096", true);
    texto(g, "Lisboa · Av. da Liberdade", 64, 560, 36, 500, "#0f766e");
  },
  // Plano Pro
  ({ g, largura: l, altura: a }) => {
    const grad = g.createLinearGradient(0, 0, l, a);
    grad.addColorStop(0, "#1c1917"); grad.addColorStop(1, "#3b2a0a");
    g.fillStyle = grad; g.beginPath(); g.roundRect(0, 0, l, a, 48); g.fill();
    pilula(g, 64, 70, 230, 64, "#ffc53d");
    texto(g, "Atalho Pro", 92, 116, 32, 800, "#1c1917");
    texto(g, "9 €", 64, 300, 120, 800, "#fff");
    texto(g, "/mês", 270, 300, 44, 500, "#a8a29e");
    texto(g, "✓  119 componentes avançados", 64, 410, 36, 500, "#e7e5e4");
    texto(g, "✓  Animações de cinema em 3D", 64, 470, 36, 500, "#e7e5e4");
    texto(g, "✓  44 sistemas completos", 64, 530, 36, 500, "#e7e5e4");
  },
  // Agenda
  ({ g, largura: l }) => {
    cartao(g, l, 672);
    texto(g, "Sábado, 18 de outubro", 64, 110, 40, 700);
    const horas = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"];
    horas.forEach((h, i) => {
      const x = 64 + (i % 3) * ((l - 128) / 3), y = 170 + Math.floor(i / 3) * 140, larg = (l - 128) / 3 - 24;
      const escolhido = i === 1;
      g.fillStyle = escolhido ? "#0f766e" : "#f5f5f4";
      g.beginPath(); g.roundRect(x, y, larg, 104, 24); g.fill();
      texto(g, h, x + larg / 2 - 56, y + 66, 40, 700, escolhido ? "#fff" : "#1c1917");
    });
    texto(g, "Corte + barba com o Rafael", 64, 520, 38, 600, "#57534e");
    pilula(g, 64, 560, l - 128, 72, "#1c1917");
    texto(g, "Confirmar marcação", l / 2 - 170, 607, 34, 700, "#fff");
  },
  // Produto
  ({ g, largura: l, altura: a }) => {
    cartao(g, l, a);
    const grad = g.createRadialGradient(240, 300, 20, 240, 300, 220);
    grad.addColorStop(0, "#fde68a"); grad.addColorStop(1, "#f59e0b");
    g.fillStyle = "#fef3c7"; g.beginPath(); g.roundRect(48, 48, 380, a - 96, 36); g.fill();
    g.fillStyle = grad; g.beginPath(); g.ellipse(238, 330, 150, 90, -0.4, 0, Math.PI * 2); g.fill();
    texto(g, "Ténis Runner Pro", 470, 150, 44, 700);
    texto(g, "★★★★★  4,9", 470, 215, 34, 600, "#f59e0b");
    texto(g, "449,90 €", 470, 330, 66, 800);
    texto(g, "ou 3x 149,97 € sem juros", 470, 385, 28, 500, "#57534e");
    pilula(g, 470, 450, l - 520, 100, "#0f766e");
    texto(g, "Comprar", 470 + (l - 520) / 2 - 80, 513, 40, 700, "#fff");
  },
];

function texturaInterface(desenhar, anisotropia) {
  const tela = canvasUI();
  desenhar(tela);
  const t = new CanvasTexture(tela.c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = anisotropia;
  return t;
}

/* ------------------------------------------------------------------------
   A tecla do Atalho (a mesma do favicon), com o "A" em relevo
   ------------------------------------------------------------------------ */

/** Cápsula (traço com pontas redondas) entre dois pontos, para desenhar o "A". */
function capsula(x1, y1, x2, y2, raio) {
  const angulo = Math.atan2(y2 - y1, x2 - x1);
  const s = new Shape();
  s.absarc(x2, y2, raio, angulo - Math.PI / 2, angulo + Math.PI / 2, false);
  s.absarc(x1, y1, raio, angulo + Math.PI / 2, angulo + Math.PI * 1.5, false);
  s.closePath();
  return s;
}

function criarTecla(leve) {
  const tecla = new Group();
  const ouro = new MeshPhysicalMaterial({
    color: OURO, metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.25,
  });
  const base = new MeshPhysicalMaterial({ color: "#1c1917", metalness: 0.2, roughness: 0.45, clearcoat: 0.6 });
  const letra = new MeshPhysicalMaterial({ color: "#16120e", metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 });

  const corpo = new Mesh(new RoundedBoxGeometry(2.6, 2.6, 0.7, leve ? 4 : 8, 0.34), ouro);
  const sombra = new Mesh(new RoundedBoxGeometry(2.6, 2.6, 0.5, 4, 0.34), base);
  sombra.position.set(0, -0.14, -0.42);
  tecla.add(sombra, corpo);

  // Mesmas linhas do favicon: M21 43 32 15l11 28M25 34h14 (traço 5), numa caixa de 64
  const escala = 2.6 / 56;
  const p = (x, y) => [(x - 32) * escala, (29 - y) * escala];
  const raio = 2.9 * escala;
  const pernas = [capsula(...p(21, 43), ...p(32, 15), raio), capsula(...p(32, 15), ...p(43, 43), raio), capsula(...p(25, 34), ...p(39, 34), raio)];
  const relevo = { depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: leve ? 2 : 4, curveSegments: leve ? 8 : 16 };
  for (const forma of pernas) {
    const m = new Mesh(new ExtrudeGeometry(forma, relevo), letra);
    m.position.z = 0.33;
    tecla.add(m);
  }
  return tecla;
}

/* ------------------------------------------------------------------------
   Poeira dourada
   ------------------------------------------------------------------------ */

function texturaBrilho() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,240,200,1)");
  grad.addColorStop(0.35, "rgba(255,197,61,0.55)");
  grad.addColorStop(1, "rgba(255,197,61,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function criarPoeira(quantidade) {
  const pos = new Float32Array(quantidade * 3);
  const vel = new Float32Array(quantidade);
  for (let i = 0; i < quantidade; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    vel[i] = 0.08 + Math.random() * 0.22;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  const pontos = new Points(geo, new PointsMaterial({ size: 0.09, map: texturaBrilho(), transparent: true, depthWrite: false, blending: AdditiveBlending, color: "#ffd77a" }));
  pontos.userData.vel = vel;
  return pontos;
}

/* ------------------------------------------------------------------------
   Cena
   ------------------------------------------------------------------------ */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ leve?: boolean }} [opcoes]
 * @returns {{ parar(): void }}
 */
export function iniciarCena(canvas, opcoes = {}) {
  const leve = opcoes.leve ?? (matchMedia("(max-width: 760px)").matches || (navigator.deviceMemory || 8) < 4);
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, leve ? 1.5 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const cena = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.2, 12);

  const luzQuente = new DirectionalLight("#fff1d6", 2.2);
  luzQuente.position.set(4, 6, 8);
  const luzFria = new DirectionalLight("#9ec5ff", 1.4);
  luzFria.position.set(-6, -2, -4);
  cena.add(luzQuente, luzFria);

  const palco = new Group();
  cena.add(palco);

  const tecla = criarTecla(leve);
  tecla.rotation.set(-0.42, 0.55, 0.08);
  palco.add(tecla);

  // Painéis de vidro com as interfaces, numa elipse à volta da tecla
  const anisotropia = renderer.capabilities.getMaxAnisotropy();
  const vidro = leve
    ? new MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.16, roughness: 0.1, metalness: 0 })
    : new MeshPhysicalMaterial({ color: "#ffffff", transmission: 1, thickness: 0.35, roughness: 0.12, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true });
  const geoVidro = new RoundedBoxGeometry(2.7, 1.8, 0.07, 3, 0.16);
  const geoTela = new PlaneGeometry(2.5, 1.64);
  const paineis = DESENHOS.map((desenhar, i) => {
    const painel = new Group();
    const tela = new Mesh(geoTela, new MeshBasicMaterial({ map: texturaInterface(desenhar, anisotropia), transparent: true, toneMapped: false }));
    tela.position.z = 0.045;
    painel.add(new Mesh(geoVidro, vidro), tela);
    const angulo = (i / DESENHOS.length) * Math.PI * 2 + 0.4;
    painel.userData = { angulo, fase: i * 1.7, raioX: 5.2, raioY: 2.5 };
    palco.add(painel);
    return painel;
  });

  const poeira = criarPoeira(leve ? 160 : 420);
  cena.add(poeira);

  /* Interação */
  const alvo = { x: 0, y: 0 };
  const ao = (e) => {
    alvo.x = (e.clientX / innerWidth) * 2 - 1;
    alvo.y = (e.clientY / innerHeight) * 2 - 1;
  };
  addEventListener("pointermove", ao, { passive: true });

  let progresso = 0;
  const aoRolar = () => {
    const altura = canvas.parentElement.offsetHeight || innerHeight;
    progresso = MathUtils.clamp(scrollY / altura, 0, 1);
  };
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* Tamanho */
  const ajustar = () => {
    const { clientWidth: l, clientHeight: a } = canvas;
    if (!l || !a) return;
    renderer.setSize(l, a, false);
    camera.aspect = l / a;
    // O canvas já ocupa só a área livre (coluna da direita ou topo): a cena fica centrada nele
    camera.position.z = l / a < 0.85 ? 18 : l / a < 1.3 ? 15.5 : 13.5;
    deslocamento = 0;
    camera.userData.yBase = 0.2;
    camera.updateProjectionMatrix();
    // Área visível no plano dos painéis (o mais próximo fica ~1 unidade à frente do centro):
    // a órbita e o tamanho dos painéis encolhem para que nenhum saia do ecrã
    const meiaAltura = Math.tan(MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - 1.2);
    const meiaLargura = meiaAltura * camera.aspect;
    const margem = 0.35;
    let escala = 1;
    let raioX = Math.min(5.2, meiaLargura - margem - 1.35);
    if (raioX < 2.4) {
      escala = MathUtils.clamp((meiaLargura - margem - 2.4) / 1.35, 0.5, 1);
      raioX = Math.max(1.6, meiaLargura - margem - 1.35 * escala);
    }
    const raioY = Math.max(1.2, Math.min(2.5, meiaAltura - margem - 0.9 * escala - 0.4));
    limites = { x: meiaLargura - margem - 1.35 * escala, y: meiaAltura - margem - 0.9 * escala };
    for (const p of paineis) {
      p.userData.raioX = raioX;
      p.userData.raioY = raioY;
      p.scale.setScalar(escala);
    }
  };
  let limites = { x: 99, y: 99 };
  let deslocamento = 0;
  const observadorTamanho = new ResizeObserver(ajustar);
  observadorTamanho.observe(canvas);
  ajustar();

  /* Ciclo */
  let visivel = true;
  let pedido = 0;
  let anterior = performance.now();
  let tempo = 0;
  const rotacao = { x: 0, y: 0 };

  function quadro(agora) {
    pedido = requestAnimationFrame(quadro);
    const dt = Math.min((agora - anterior) / 1000, 0.05);
    anterior = agora;
    tempo += dt;

    rotacao.x = MathUtils.lerp(rotacao.x, alvo.y * 0.12, 0.05);
    rotacao.y = MathUtils.lerp(rotacao.y, alvo.x * 0.22, 0.05);
    palco.rotation.set(rotacao.x, rotacao.y, 0);
    palco.position.x = MathUtils.lerp(palco.position.x, deslocamento, 0.08);

    // A tecla flutua, e "carrega" um pouco quando se rola a página
    tecla.position.y = Math.sin(tempo * 0.9) * 0.12 - progresso * 0.4;
    tecla.rotation.y = 0.55 + Math.sin(tempo * 0.35) * 0.18 + progresso * 0.6;
    tecla.rotation.x = -0.42 + progresso * 0.35;
    const escalaTecla = 1 - progresso * 0.18;
    tecla.scale.setScalar(escalaTecla);

    // Os painéis orbitam devagar e abrem-se com o scroll (vista "explodida")
    for (const p of paineis) {
      const u = p.userData;
      const a = u.angulo + tempo * 0.06;
      const abertura = 1 + progresso * 0.55;
      // A vista "explodida" do scroll abre a órbita, mas nunca para fora do ecrã
      const x = MathUtils.clamp(Math.cos(a) * u.raioX * abertura, -limites.x, limites.x);
      const y = MathUtils.clamp(Math.sin(a) * u.raioY * abertura + Math.sin(tempo * 0.8 + u.fase) * 0.1, -limites.y, limites.y);
      p.position.set(x, y, Math.sin(a) * 1.6 - 0.6 - progresso * 1.5);
      p.rotation.set(Math.sin(tempo * 0.5 + u.fase) * 0.05 - p.position.y * 0.06, -p.position.x * 0.07, Math.sin(tempo * 0.3 + u.fase) * 0.03);
    }

    // Poeira sobe devagar e volta a baixo
    const pos = poeira.geometry.attributes.position;
    const vel = poeira.userData.vel;
    for (let i = 0; i < vel.length; i++) {
      let y = pos.array[i * 3 + 1] + vel[i] * dt;
      if (y > 5) y = -5;
      pos.array[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
    poeira.rotation.y = tempo * 0.02;

    const yBase = camera.userData.yBase ?? 0.2;
    camera.position.y = yBase - progresso * 0.6;
    camera.lookAt(0, yBase - 0.2 - progresso * 0.3, 0);
    renderer.render(cena, camera);
  }

  const ligar = () => {
    if (!pedido && visivel && !document.hidden) {
      anterior = performance.now();
      pedido = requestAnimationFrame(quadro);
    }
  };
  const desligar = () => {
    cancelAnimationFrame(pedido);
    pedido = 0;
  };
  const observadorVista = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    visivel ? ligar() : desligar();
  });
  observadorVista.observe(canvas);
  const aoMudarVisibilidade = () => (document.hidden ? desligar() : ligar());
  document.addEventListener("visibilitychange", aoMudarVisibilidade);
  ligar();

  return {
    parar() {
      desligar();
      observadorVista.disconnect();
      observadorTamanho.disconnect();
      removeEventListener("pointermove", ao);
      removeEventListener("scroll", aoRolar);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
