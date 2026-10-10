import { gsap } from 'gsap';
import { reduceMotion, EASE } from './motion';

const NS = 'http://www.w3.org/2000/svg';
const X0 = 70,
  X1 = 930,
  Y = 156,
  STEP = 34;

export function init(root: HTMLElement) {
  const reduce = reduceMotion();
  const holes = root.querySelector<SVGGElement>('[data-sd-holes]')!;
  const group = root.querySelector<SVGGElement>('[data-sd-stitches]')!;
  const loose = root.querySelector<SVGPathElement>('[data-sd-loose]')!;
  const scissors = root.querySelector<SVGGElement>('[data-sd-scissors]')!;
  const status = root.querySelector<HTMLElement>('[data-sd-status]')!;
  const cutBtn = root.querySelector<HTMLButtonElement>('[data-sd-cut]')!;
  let mode: 'saddle' | 'machine' = 'saddle';
  let stitches: SVGLineElement[] = [];
  let cut = false;
  let tl: gsap.core.Timeline | null = null;

  const build = () => {
    tl?.kill();
    cut = false;
    cutBtn.disabled = false;
    holes.innerHTML = '';
    group.innerHTML = '';
    loose.setAttribute('d', '');
    stitches = [];
    for (let x = X0; x <= X1; x += STEP) {
      const h = document.createElementNS(NS, 'ellipse');
      h.setAttribute('cx', String(x));
      h.setAttribute('cy', String(Y));
      h.setAttribute('rx', '3.2');
      h.setAttribute('ry', '2.4');
      h.setAttribute('fill', 'rgb(0 0 0 / .55)');
      holes.appendChild(h);
      if (x + STEP > X1) break;
      const l = document.createElementNS(NS, 'line');
      if (mode === 'saddle') {
        // Saraç dikişi: eğik, dolgun ilmekler
        l.setAttribute('x1', String(x + 3));
        l.setAttribute('y1', String(Y - 7));
        l.setAttribute('x2', String(x + STEP - 3));
        l.setAttribute('y2', String(Y + 7));
        l.setAttribute('stroke-width', '7');
      } else {
        l.setAttribute('x1', String(x + 4));
        l.setAttribute('y1', String(Y));
        l.setAttribute('x2', String(x + STEP - 4));
        l.setAttribute('y2', String(Y));
        l.setAttribute('stroke-width', '4');
      }
      l.setAttribute('stroke', '#3b5cff');
      l.setAttribute('stroke-linecap', 'round');
      l.style.transformBox = 'fill-box';
      l.style.transformOrigin = 'center';
      group.appendChild(l);
      stitches.push(l);
    }
    if (!reduce) {
      gsap.fromTo(stitches, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.025, ease: 'back.out(2)' });
    }
    status.textContent =
      mode === 'saddle' ? 'Saraç dikişi hazır. Ortadaki ilmeği kesin.' : 'Zincir/makine dikişi hazır. Ortadaki ilmeği kesin.';
  };

  const doCut = () => {
    if (cut) return;
    cut = true;
    cutBtn.disabled = true;
    const c = Math.floor(stitches.length / 2);
    const s = stitches[c];
    const cx = (Number(s.getAttribute('x1')) + Number(s.getAttribute('x2'))) / 2;
    tl = gsap.timeline();
    tl.set(scissors, { attr: { transform: `translate(${cx} ${Y - 70})` }, opacity: 0 })
      .to(scissors, { opacity: 1, duration: reduce ? 0 : 0.2 })
      .to(scissors, { attr: { transform: `translate(${cx} ${Y + 14})` }, duration: reduce ? 0 : 0.35, ease: EASE.press })
      .to(s, { opacity: 0, scale: 0.2, rotation: 40, duration: reduce ? 0 : 0.3 })
      .to(scissors, { opacity: 0, attr: { transform: `translate(${cx + 40} ${Y + 60})` }, duration: reduce ? 0 : 0.4 }, '<');

    if (mode === 'machine') {
      // Zincir dikiş: kesilen noktadan sonrası sökülür
      const rest = stitches.slice(c + 1);
      const pts: [number, number][] = [[cx, Y]];
      rest.forEach((st, i) => {
        tl!.to(
          st,
          { opacity: 0, y: -16 - Math.random() * 10, rotation: (Math.random() - 0.5) * 60, duration: reduce ? 0 : 0.28, ease: 'power2.out' },
          (reduce ? 0 : 0.9) + i * (reduce ? 0 : 0.07),
        );
        pts.push([Number(st.getAttribute('x2')), Y + 30 + Math.sin(i * 1.3) * 26 + i * 4]);
      });
      const d = pts.map((p, i) => (i ? `L${p[0]} ${p[1]}` : `M${p[0]} ${p[1]}`)).join(' ');
      loose.setAttribute('d', d);
      const len = loose.getTotalLength();
      tl.fromTo(
        loose,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: reduce ? 0 : rest.length * 0.07 + 0.3, ease: 'none' },
        reduce ? 0 : 0.9,
      );
      tl.add(() => {
        status.textContent = `Bir ilmek koptu ve ${rest.length} ilmek arkasından söküldü. Dikiş açıldı.`;
      });
    } else {
      // Saraç dikişi: komşular sarsılır ama yerinde kalır
      const near = [stitches[c - 1], stitches[c + 1]].filter(Boolean);
      tl.to(near, { rotation: 8, duration: reduce ? 0 : 0.08, yoyo: true, repeat: reduce ? 0 : 5, ease: 'sine.inOut' }, '-=0.1').set(near, {
        rotation: 0,
      });
      tl.add(() => {
        status.textContent = `Tek ilmek koptu; kalan ${stitches.length - 1} ilmek yerinde. Dikiş sökülmedi.`;
      });
    }
  };

  root.querySelectorAll<HTMLInputElement>('input[name="sd-mode"]').forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        mode = r.value as typeof mode;
        build();
      }
    }),
  );
  cutBtn.addEventListener('click', doCut);
  root.querySelector('[data-sd-reset]')!.addEventListener('click', build);
  build();
  return () => tl?.kill();
}
