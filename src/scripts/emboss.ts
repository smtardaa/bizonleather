import { gsap } from 'gsap';
import { reduceMotion } from './motion';
import { fitStitch, whenVisible, clamp } from './util';

/* ==========================================================================
   ADINI BAS — sıcak gömme baskı simülasyonu
   1) Deri dokusu (gözenek hücreleri + kırışıklar) bir kez prosedürel olarak
      hesaplanıp dokuya yazılır.
   2) Metin, 2D canvas'ta bulanıklaştırılmış bir yükseklik maskesine çevrilir.
   3) Ana shader: maske derinliği × baskı ilerlemesi ile normal hesaplar,
      imleci izleyen yan ışıkla aydınlatır; baskı alanı koyulaşır ve parlar
      (sıcak baskının deriyi "cilalaması"). Basmadan önce damganın gölgesi
      deriye düşer ve damga yaklaştıkça keskinleşir.
   ========================================================================== */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const NOISE = `
uniform float uSeed;
float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uSeed)*43758.5453);}
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p+uSeed)*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}
float wor(vec2 p){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=h2(i+g);o=.5+.42*sin(6.2831*o);
  vec2 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2){d2=d;}}
  return sqrt(d2)-sqrt(d1);}
vec2 warp(vec2 q){return q+vec2(fbm(q*.02),fbm(q*.02+5.2))*14.;}
float cells(vec2 q){return smoothstep(0.,.22,wor(warp(q)*.15))*.7+smoothstep(0.,.3,wor(warp(q*1.7+11.)*.11))*.3;}
float H(vec2 q){return cells(q)*.32+smoothstep(0.,.55,wor(q*.38+3.))*.07+fbm(q*.05)*.08+fbm(q*.0032)*1.1;}
`;

const GRAIN_FRAG = `precision highp float;
uniform float uScale;
${NOISE}
void main(){
  vec2 q=gl_FragCoord.xy/uScale;
  float e=.75;
  float hx=H(q+vec2(e,0.))-H(q-vec2(e,0.));
  float hy=H(q+vec2(0.,e))-H(q-vec2(0.,e));
  vec2 n=clamp(vec2(-hx,-hy)/(2.*e)*2.4,-1.,1.);
  gl_FragColor=vec4(n*.5+.5,cells(q),fbm(q*.006+9.));
}`;

const MAIN_FRAG = `precision highp float;
uniform vec2 uRes;uniform float uScale;
uniform sampler2D uGrain;uniform sampler2D uMask;
uniform vec2 uLight;uniform vec3 uBase;
uniform float uPress,uHover,uHeat,uDepth;
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec4 g=texture2D(uGrain,uv);
  vec2 gn=g.rg*2.-1.;
  vec4 mk=texture2D(uMask,uv);
  float m=mk.r, mb=mk.g;
  vec2 t=vec2(1.25*uScale)/uRes;
  float mx=texture2D(uMask,uv+vec2(t.x,0.)).r-texture2D(uMask,uv-vec2(t.x,0.)).r;
  float my=texture2D(uMask,uv+vec2(0.,t.y)).r-texture2D(uMask,uv-vec2(0.,t.y)).r;
  float P=uPress;
  float smoothIn=1.-.82*m*P;
  vec2 nxy=gn*.85*smoothIn+uDepth*P*vec2(mx,my);
  vec3 N=normalize(vec3(nxy,1.));

  vec2 fp=gl_FragCoord.xy/uScale;
  vec2 res=uRes/uScale;
  vec2 lp=uLight*res;
  vec3 L=normalize(vec3(lp-fp,res.x*.32));
  vec3 Hh=normalize(L+vec3(0.,0.,1.));
  float ndl=dot(N,L);
  float wrapd=max((ndl+.2)/1.2,0.);
  float nh=max(dot(N,Hh),0.);
  float spec=pow(nh,mix(26.,80.,m*P))*mix(.10,.42,m*P)+pow(nh,5.)*.05;

  vec3 alb=uBase*(.72+.55*g.a)*mix(.55,1.,g.b);
  alb=mix(alb,alb*.42,m*P);
  float wall=clamp(length(vec2(mx,my))*2.2,0.,1.)*P;
  float ao=1.-.45*wall;

  vec2 away=normalize(fp-lp+vec2(.001));
  float off=4.+(1.-uHover)*22.;
  vec2 suv=(fp-away*off)*uScale/uRes;
  float sh=texture2D(uMask,suv).g*uHover*.62*(1.-P);

  float glow=mb*uHeat*(1.-P);
  vec3 col=alb*(.14+1.15*wrapd)*ao*(1.-sh)+vec3(1.,.95,.86)*spec+vec3(1.,.42,.12)*glow*.16;
  vec2 c=uv-.5;c.x*=uRes.x/uRes.y;
  col*=1.-.6*smoothstep(.28,1.05,length(c));
  gl_FragColor=vec4(pow(max(col,0.),vec3(.4545)),1.);
}`;

const LEATHER: Record<string, [number, number, number]> = {
  // doğrusal renk uzayında (sRGB → linear)
  yesil: [0.016, 0.075, 0.04],
  kahverengi: [0.2, 0.072, 0.026],
};
const LEATHER_CSS: Record<string, string> = { yesil: '#1f4a35', kahverengi: '#7a4a2a' };

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}
function program(gl: WebGLRenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(p, 0, 'p');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  return p;
}

// Ayrılabilir kutu bulanıklığı (3 tur ≈ gauss)
function blur(src: Float32Array, w: number, h: number, r: number) {
  r = Math.max(1, Math.round(r));
  let a = src.slice();
  let b = new Float32Array(a.length);
  const pass = (from: Float32Array, to: Float32Array, horiz: boolean) => {
    const len = horiz ? w : h;
    const lines = horiz ? h : w;
    const inv = 1 / (r * 2 + 1);
    for (let l = 0; l < lines; l++) {
      let acc = 0;
      const idx = (i: number) => (horiz ? l * w + clamp(i, 0, len - 1) : clamp(i, 0, len - 1) * w + l);
      for (let i = -r; i <= r; i++) acc += from[idx(i)];
      for (let i = 0; i < len; i++) {
        to[horiz ? l * w + i : i * w + l] = acc * inv;
        acc += from[idx(i + r + 1)] - from[idx(i - r)];
      }
    }
  };
  for (let k = 0; k < 3; k++) {
    pass(a, b, true);
    pass(b, a, false);
  }
  return a;
}

export async function init(root: HTMLElement) {
  const reduce = reduceMotion();
  const stage = root.querySelector<HTMLElement>('[data-emb-stage]')!;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-emb-canvas]')!;
  const typeEl = root.querySelector<HTMLElement>('[data-emb-type]')!;
  const input = root.querySelector<HTMLInputElement>('[data-emb-input]')!;
  const count = root.querySelector<HTMLElement>('[data-emb-count]')!;
  const form = root.querySelector<HTMLFormElement>('[data-emb-form]')!;
  const pressBtn = root.querySelector<HTMLButtonElement>('[data-emb-press]')!;
  const pressLabel = root.querySelector<HTMLElement>('[data-emb-press-label]')!;
  const status = root.querySelector<HTMLElement>('[data-emb-status]')!;
  const hint = root.querySelector<HTMLElement>('[data-emb-hint]')!;
  const after = root.querySelector<HTMLElement>('[data-emb-after]')!;
  const mail = root.querySelector<HTMLAnchorElement>('[data-emb-mail]')!;
  const fbText = root.querySelector<HTMLElement>('[data-emb-fallback-text]')!;
  const disposers: (() => void)[] = [];

  disposers.push(fitStitch(root.querySelector<SVGSVGElement>('.emb-stitch')!, 14, 14));

  const state = {
    text: '',
    leather: 'yesil',
    face: 'blok',
    press: 0,
    hover: 0,
    heat: 0,
    light: { x: 0.3, y: 0.75 },
    target: { x: 0.3, y: 0.75 },
    pointerIn: false,
    phase: 'idle' as 'idle' | 'heating' | 'pressing' | 'pressed' | 'lifting',
    fontPx: 100,
  };

  const normText = (v: string) => v.toLocaleUpperCase('tr-TR').replace(/\s+/g, ' ').slice(0, 14);

  // ---------- WebGL kurulumu ----------
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false }) as WebGLRenderingContext | null;
  } catch {
    gl = null;
  }
  if (!gl) {
    root.classList.add('is-fallback');
  }

  let grainProg: WebGLProgram, mainProg: WebGLProgram;
  let grainTex: WebGLTexture, maskTex: WebGLTexture, fbo: WebGLFramebuffer;
  let W = 0,
    Hh = 0,
    dpr = 1,
    cssW = 0,
    cssH = 0;
  const maskCanvas = document.createElement('canvas');
  const mctx = maskCanvas.getContext('2d', { willReadFrequently: true })!;
  const uni: Record<string, WebGLUniformLocation | null> = {};

  if (gl) {
    grainProg = program(gl, GRAIN_FRAG);
    mainProg = program(gl, MAIN_FRAG);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const mkTex = () => {
      const t = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, t);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      return t;
    };
    grainTex = mkTex();
    maskTex = mkTex();
    fbo = gl.createFramebuffer()!;
    for (const n of ['uRes', 'uScale', 'uGrain', 'uMask', 'uLight', 'uBase', 'uPress', 'uHover', 'uHeat', 'uDepth', 'uSeed'])
      uni[n] = gl.getUniformLocation(mainProg, n);
  }

  const seed = Math.random() * 10;

  const bakeGrain = () => {
    if (!gl) return;
    gl.bindTexture(gl.TEXTURE_2D, grainTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, Hh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, grainTex, 0);
    gl.viewport(0, 0, W, Hh);
    gl.useProgram(grainProg);
    gl.uniform1f(gl.getUniformLocation(grainProg, 'uScale'), dpr);
    gl.uniform1f(gl.getUniformLocation(grainProg, 'uSeed'), seed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const fontFor = (px: number) =>
    state.face === 'blok' ? `800 expanded ${px}px "Archivo Variable", sans-serif` : `600 semi-condensed ${px}px "Archivo Variable", sans-serif`;

  const bakeMask = () => {
    const text = state.text || ' ';
    const w = Math.max(2, Math.round(cssW));
    const h = Math.max(2, Math.round(cssH));
    maskCanvas.width = w;
    maskCanvas.height = h;
    mctx.fillStyle = '#000';
    mctx.fillRect(0, 0, w, h);
    const ctxAny = mctx as any;
    if ('fontStretch' in ctxAny) ctxAny.fontStretch = state.face === 'blok' ? 'expanded' : 'semi-condensed';
    if ('letterSpacing' in ctxAny) ctxAny.letterSpacing = state.face === 'blok' ? '2px' : '1px';
    mctx.font = fontFor(100);
    const m = mctx.measureText(text);
    const tw = Math.max(1, m.width);
    let px = Math.min((w * 0.74 * 100) / tw, h * 0.3);
    px = clamp(px, 18, 260);
    state.fontPx = px;
    mctx.font = fontFor(px);
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = '#fff';
    mctx.fillText(text, w / 2, h / 2 + px * 0.04);
    const img = mctx.getImageData(0, 0, w, h);
    const src = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) src[i] = img.data[i * 4] / 255;
    const soft = blur(src, w, h, Math.max(1, px * 0.012));
    const wide = blur(src, w, h, px * 0.09);
    for (let i = 0; i < w * h; i++) {
      img.data[i * 4] = soft[i] * 255;
      img.data[i * 4 + 1] = wide[i] * 255;
      img.data[i * 4 + 2] = 0;
      img.data[i * 4 + 3] = 255;
    }
    if (!gl) return;
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  };

  const draw = () => {
    if (!gl) return;
    gl.viewport(0, 0, W, Hh);
    gl.useProgram(mainProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grainTex);
    gl.uniform1i(uni.uGrain, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.uniform1i(uni.uMask, 1);
    gl.uniform2f(uni.uRes, W, Hh);
    gl.uniform1f(uni.uScale, dpr);
    gl.uniform2f(uni.uLight, state.light.x, state.light.y);
    gl.uniform3fv(uni.uBase, LEATHER[state.leather]);
    gl.uniform1f(uni.uPress, state.press);
    gl.uniform1f(uni.uHover, state.hover);
    gl.uniform1f(uni.uHeat, state.heat);
    gl.uniform1f(uni.uDepth, 2.4);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    const r = stage.getBoundingClientRect();
    cssW = r.width;
    cssH = r.height;
    const coarse = matchMedia('(pointer: coarse)').matches;
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
    W = Math.max(2, Math.round(cssW * dpr));
    Hh = Math.max(2, Math.round(cssH * dpr));
    canvas.width = W;
    canvas.height = Hh;
    bakeGrain();
    bakeMask();
    layoutType();
    draw();
  };

  // ---------- Pirinç harf dizisi ----------
  const renderType = () => {
    typeEl.dataset.face = state.face;
    typeEl.innerHTML = '';
    for (const ch of state.text) {
      const s = document.createElement('span');
      s.className = 'sort' + (ch === ' ' ? ' is-space' : '');
      s.textContent = ch === ' ' ? ' ' : ch;
      typeEl.appendChild(s);
    }
    layoutType();
  };
  const layoutType = () => {
    typeEl.style.fontSize = `${state.fontPx * 0.86}px`;
  };

  // ---------- Etkileşim ----------
  const setStatus = (t: string) => (status.textContent = t);
  const updateMail = () => {
    const body = `Merhaba,\n\nŞu kişiselleştirmeyi istiyorum:\n\nMetin: ${state.text}\nDeri rengi: ${state.leather === 'yesil' ? 'Yeşil' : 'Kahverengi'}\nHarf stili: ${state.face === 'blok' ? 'Blok' : 'İnce'}\nÜrün: \n\nTeşekkürler.`;
    mail.href = `mailto:leatherbizon@gmail.com?subject=${encodeURIComponent('Kişiselleştirme talebi — ' + state.text)}&body=${encodeURIComponent(body)}`;
  };

  let heatTween: gsap.core.Tween | null = null;
  let pressTl: gsap.core.Timeline | null = null;
  let justPressed = false;

  const showType = (instant = false) => {
    gsap.killTweensOf(typeEl);
    gsap.to(typeEl, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: instant || reduce ? 0 : 0.7,
      ease: 'expo.out',
    });
    gsap.to(state, { hover: 0.25, duration: reduce ? 0 : 0.6 });
    hint.style.opacity = '1';
  };

  const lift = (then?: () => void) => {
    // Damga kalkar, yeni deri parçası hazırlanır
    pressTl?.kill();
    state.phase = 'lifting';
    after.hidden = true;
    gsap.to(state, {
      press: 0,
      duration: reduce ? 0 : 0.45,
      ease: 'power2.inOut',
      onComplete: () => {
        state.phase = 'idle';
        then?.();
        showType();
      },
    });
  };

  const applyText = (v: string) => {
    const t = normText(v);
    if (t === state.text && state.phase !== 'pressed') return;
    const go = () => {
      state.text = t;
      fbText.textContent = t || ' ';
      bakeMask();
      renderType();
      updateMail();
    };
    if (state.phase === 'pressed' || state.press > 0.01) lift(go);
    else go();
    count.textContent = `${t.length}/14`;
  };

  const startHeat = () => {
    if (state.phase === 'heating' || state.phase === 'pressing') return;
    if (!state.text.trim()) {
      setStatus('Önce bir metin yaz.');
      input.focus();
      return;
    }
    if (state.phase === 'pressed') {
      // Yeni bir baskı için önce deriyi yenile
      lift(() => startHeat());
      return;
    }
    state.phase = 'heating';
    stage.classList.add('is-heating');
    hint.style.opacity = '0';
    setStatus('Pirinç harfler ısınıyor…');
    pressLabel.textContent = 'Isınıyor — bırakınca basar';
    heatTween?.kill();
    heatTween = gsap.to(state, {
      heat: 1,
      hover: 0.85,
      duration: reduce ? 0.01 : 1.2,
      ease: 'power1.out',
      onUpdate: () => {
        typeEl.style.setProperty('--heat', state.heat.toFixed(3));
        pressBtn.style.setProperty('--heat', state.heat.toFixed(3));
      },
    });
    if (!reduce) gsap.to(typeEl, { scale: 0.97, y: 4, duration: 1.2, ease: 'power1.out' });
  };

  const release = () => {
    if (state.phase !== 'heating') return;
    heatTween?.kill();
    state.phase = 'pressing';
    stage.classList.remove('is-heating');
    const depth = 0.5 + 0.5 * state.heat;
    justPressed = true;
    setTimeout(() => (justPressed = false), 400);
    pressTl = gsap
      .timeline({
        onComplete: () => {
          state.phase = 'pressed';
          pressLabel.textContent = 'Yeniden bas';
          setStatus(`Baskı tamam — "${state.text}" derinin dokusuna işlendi.`);
          after.hidden = false;
          if (!reduce) gsap.fromTo(after.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: 'expo.out' });
        },
      })
      // damga iner
      .to(typeEl, { scale: 0.9, y: 10, duration: reduce ? 0 : 0.14, ease: 'power3.in' }, 0)
      .to(state, { hover: 1, duration: reduce ? 0 : 0.14, ease: 'power3.in' }, 0)
      // temas: deri çöker
      .add(() => {
        if (navigator.vibrate) navigator.vibrate(14);
      })
      .to(state, { press: depth, duration: reduce ? 0 : 0.42, ease: 'power2.out' })
      .fromTo(stage, { scale: 1 }, { scale: 0.992, duration: reduce ? 0 : 0.08, yoyo: true, repeat: reduce ? 0 : 1, ease: 'power1.inOut' }, '<')
      // damga kalkar
      .to(typeEl, { opacity: 0, y: -40, scale: 1.06, duration: reduce ? 0 : 0.7, ease: 'expo.out' }, '>-0.05')
      .to(state, { hover: 0, heat: 0, duration: reduce ? 0 : 0.6, ease: 'power2.out' }, '<')
      .add(() => {
        typeEl.style.setProperty('--heat', '0');
        pressBtn.style.setProperty('--heat', '0');
      });
  };

  const cancelHeat = () => {
    // Tarayıcı kaydırmayı devraldı (mobil): basma, ısıyı geri al
    if (state.phase !== 'heating') return;
    heatTween?.kill();
    state.phase = 'idle';
    stage.classList.remove('is-heating');
    pressLabel.textContent = 'Basılı tut, sonra bırak';
    setStatus('');
    gsap.to(state, {
      heat: 0,
      hover: 0.25,
      duration: 0.4,
      onUpdate: () => {
        typeEl.style.setProperty('--heat', state.heat.toFixed(3));
        pressBtn.style.setProperty('--heat', state.heat.toFixed(3));
      },
    });
    showType();
  };

  // İşaretçi: buton ve sahne
  const bindHold = (el: HTMLElement) => {
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      startHeat();
    });
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', cancelHeat);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  };
  bindHold(pressBtn);
  bindHold(stage);

  // Klavye: Space/Enter basılı tutulur
  pressBtn.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      startHeat();
    }
  });
  pressBtn.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      release();
    }
  });
  // Ekran okuyucu "tıklaması" (pointer/klavye olayı olmadan)
  pressBtn.addEventListener('click', (e) => {
    if (justPressed || state.phase === 'heating') return;
    if ((e as PointerEvent).pointerType) return;
    startHeat();
    gsap.delayedCall(reduce ? 0 : 0.5, release);
  });

  input.addEventListener('input', () => applyText(input.value));
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'leather') {
      state.leather = t.value;
      root.style.setProperty('--leather', LEATHER_CSS[t.value]);
      stage.style.setProperty('--leather', LEATHER_CSS[t.value]);
      updateMail();
    }
    if (t.name === 'face') {
      state.face = t.value;
      const go = () => {
        bakeMask();
        renderType();
        updateMail();
      };
      if (state.phase === 'pressed') lift(go);
      else go();
    }
  });

  root.querySelector('[data-emb-download]')!.addEventListener('click', () => {
    if (!gl) return;
    draw();
    const a = document.createElement('a');
    a.download = `bizon-baski-${state.text.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase() || 'onizleme'}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  // Işık: imleci izler; dokunmatikte ve boştayken yavaşça dolaşır
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    state.target.x = (e.clientX - r.left) / r.width;
    state.target.y = 1 - (e.clientY - r.top) / r.height;
    state.pointerIn = e.pointerType === 'mouse';
  });
  stage.addEventListener('pointerleave', () => (state.pointerIn = false));

  // ---------- Döngü ----------
  let raf = 0;
  let running = false;
  const t0 = performance.now();
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!state.pointerIn && !reduce) {
      const t = (now - t0) / 1000;
      state.target.x = 0.5 + Math.cos(t * 0.35) * 0.32;
      state.target.y = 0.62 + Math.sin(t * 0.5) * 0.22;
    }
    state.light.x += (state.target.x - state.light.x) * 0.08;
    state.light.y += (state.target.y - state.light.y) * 0.08;
    draw();
  };
  const start = () => {
    if (running || !gl) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Font yüklenmeden maske çizilmesin
  try {
    await Promise.all([
      document.fonts.load('800 100px "Archivo Variable"'),
      document.fonts.load('600 100px "Archivo Variable"'),
      document.fonts.load('800 100px "Archivo Variable"', 'İĞŞÇÖÜ'),
    ]);
  } catch {}

  state.text = normText(input.value);
  count.textContent = `${state.text.length}/14`;
  fbText.textContent = state.text;
  updateMail();
  resize();
  renderType();
  gsap.set(typeEl, { opacity: 1 });
  state.hover = 0.25;
  setStatus('');

  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(stage);
  disposers.push(() => ro.disconnect());
  disposers.push(whenVisible(stage, (v) => (v ? start() : stop()), '100px'));

  return () => {
    stop();
    heatTween?.kill();
    pressTl?.kill();
    disposers.forEach((d) => d());
    const lose = gl?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
  };
}
