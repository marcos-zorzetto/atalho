var T="attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }",_=`
precision highp float;
uniform vec2 tamanho;
uniform float tempo;
uniform vec3 cor1;
uniform vec3 cor2;
uniform vec3 cor3;

// Ru\xEDdo suave (value noise) para as ondas
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
  // Tr\xEAs faixas de luz que sobem e descem ao longo do eixo X
  float f1 = smoothstep(0.32, 0.0, abs(uv.y - 0.62 - 0.14 * sin(p.x * 2.1 + t * 6.0) - (n - 0.5) * 0.35));
  float f2 = smoothstep(0.28, 0.0, abs(uv.y - 0.48 - 0.12 * sin(p.x * 1.7 - t * 5.0 + 1.3) - (n - 0.5) * 0.4));
  float f3 = smoothstep(0.24, 0.0, abs(uv.y - 0.36 - 0.1 * sin(p.x * 2.6 + t * 4.0 + 2.1) - (n - 0.5) * 0.3));
  vec3 cor = cor1 * f1 * 0.9 + cor2 * f2 * 0.75 + cor3 * f3 * 0.6;
  // Estrelas finas
  float estrela = step(0.9975, ruido(gl_FragCoord.xy * 0.35)) * (0.5 + 0.5 * sin(tempo * 2.0 + gl_FragCoord.x));
  cor += vec3(estrela) * 0.6 * (1.0 - uv.y * 0.5);
  gl_FragColor = vec4(cor * (0.65 + 0.35 * n), 1.0);
}`,m=t=>[1,3,5].map(a=>parseInt(t.slice(a,a+2),16)/255);function S(t,{cores:a=["#ffc53d","#14b8a6","#7c3aed"],velocidade:A=1}={}){let e=t.getContext("webgl",{antialias:!1,premultipliedAlpha:!1});if(!e)return{parar(){}};let d=(o,F)=>{let f=e.createShader(o);return e.shaderSource(f,F),e.compileShader(f),f},r=e.createProgram();if(e.attachShader(r,d(e.VERTEX_SHADER,T)),e.attachShader(r,d(e.FRAGMENT_SHADER,_)),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))return{parar(){}};e.useProgram(r);let x=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,x),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);let l=e.getAttribLocation(r,"p");e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0);let i=o=>e.getUniformLocation(r,o),R=i("tamanho"),y=i("tempo");e.uniform3fv(i("cor1"),m(a[0])),e.uniform3fv(i("cor2"),m(a[1])),e.uniform3fv(i("cor3"),m(a[2]));let u=()=>{let o=Math.min(devicePixelRatio,2)*.5;t.width=Math.max(1,Math.round(t.clientWidth*o)),t.height=Math.max(1,Math.round(t.clientHeight*o)),e.viewport(0,0,t.width,t.height),e.uniform2f(R,t.width,t.height)},p=new ResizeObserver(u);p.observe(t),u();let n=0,c=!1,E=performance.now(),v=o=>{n=requestAnimationFrame(v),e.uniform1f(y,(o-E)/1e3*A),e.drawArrays(e.TRIANGLE_STRIP,0,4)},h=()=>{!n&&c&&!document.hidden&&(n=requestAnimationFrame(v))},s=()=>{cancelAnimationFrame(n),n=0},g=new IntersectionObserver(([o])=>{c=o.isIntersecting,c?h():s()});g.observe(t);let b=()=>document.hidden?s():h();return document.addEventListener("visibilitychange",b),{parar(){s(),g.disconnect(),p.disconnect(),document.removeEventListener("visibilitychange",b)}}}export{S as iniciarAurora};
