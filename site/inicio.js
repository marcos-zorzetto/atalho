/*
 * Comportamento da página inicial "cinema":
 * - carrega a cena 3D e a aurora só se o dispositivo aguentar (WebGL, sem
 *   "reduzir movimento", sem poupança de dados) e depois de a página aparecer;
 * - revela blocos ao rolar, acende o manifesto palavra a palavra e conta os números.
 */
(function () {
  "use strict";

  const base = document.body.dataset.base || "/";
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const poupar = navigator.connection && navigator.connection.saveData;

  function temWebGL() {
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  }

  /* Cena 3D e aurora (módulos carregados à parte) */
  function carregar3D() {
    if (calmo || poupar || !temWebGL()) return;
    const cena = document.querySelector("[data-cena-3d]");
    if (cena) {
      import(`${base}site/3d/cena-inicio.js`)
        .then(({ iniciarCena }) => {
          iniciarCena(cena);
          requestAnimationFrame(() => cena.classList.add("cine-pronta"));
        })
        .catch(() => {});
    }
    const aurora = document.querySelector("[data-aurora]");
    if (aurora) import(`${base}site/3d/aurora.js`).then(({ iniciarAurora }) => iniciarAurora(aurora)).catch(() => {});
  }
  if ("requestIdleCallback" in window) requestIdleCallback(carregar3D, { timeout: 1500 });
  else setTimeout(carregar3D, 300);

  /* Revelar ao rolar */
  const revelar = document.querySelectorAll("[data-revelar]");
  if (calmo || !("IntersectionObserver" in window)) {
    revelar.forEach((el) => el.classList.add("cine-visivel"));
  } else {
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add("cine-visivel");
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revelar.forEach((el) => obs.observe(el));
  }

  /* Manifesto: cada palavra acende conforme o texto sobe no ecrã */
  const manifesto = document.querySelector("[data-palavras]");
  if (manifesto) {
    const DESTAQUES = new Set(["cinema.", "clique.", "português,", "vender"]);
    const palavras = manifesto.textContent.trim().split(/\s+/);
    manifesto.textContent = "";
    const spans = palavras.map((p, i) => {
      const s = document.createElement("span");
      s.className = "cine-palavra" + (DESTAQUES.has(p) ? " cine-destaque" : "");
      s.textContent = p;
      manifesto.append(s, i < palavras.length - 1 ? " " : "");
      return s;
    });
    if (calmo) spans.forEach((s) => s.classList.add("cine-acesa"));
    else {
      let pendente = false;
      const atualizar = () => {
        pendente = false;
        const r = manifesto.getBoundingClientRect();
        // 0 quando o texto entra por baixo, 1 quando chega a um terço do ecrã
        const progresso = Math.min(1, Math.max(0, (innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.45)));
        const acesas = Math.round(progresso * spans.length);
        spans.forEach((s, i) => s.classList.toggle("cine-acesa", i < acesas));
      };
      addEventListener("scroll", () => { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }, { passive: true });
      atualizar();
    }
  }

  /* Números que contam até ao valor */
  const numeros = document.querySelectorAll("[data-contar]");
  if (!calmo && "IntersectionObserver" in window) {
    const formato = new Intl.NumberFormat("pt-PT");
    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        obs.unobserve(e.target);
        const alvo = Number(e.target.dataset.contar);
        const inicio = performance.now();
        const passo = (agora) => {
          const t = Math.min(1, (agora - inicio) / 1600);
          const suave = 1 - Math.pow(1 - t, 4);
          e.target.textContent = formato.format(Math.round(alvo * suave));
          if (t < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      }
    }, { threshold: 0.6 });
    numeros.forEach((n) => obs.observe(n));
  }
})();
