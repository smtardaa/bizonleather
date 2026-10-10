// SVG dikiş çerçevelerini kapsayıcının gerçek boyutuna oturtur.
export function fitStitch(svg: SVGSVGElement, inset = 12, radius = 10) {
  const apply = () => {
    const { width, height } = svg.getBoundingClientRect();
    svg.querySelectorAll('rect').forEach((r) => {
      r.setAttribute('x', String(inset));
      r.setAttribute('y', String(inset));
      r.setAttribute('width', String(Math.max(0, width - inset * 2)));
      r.setAttribute('height', String(Math.max(0, height - inset * 2)));
      r.setAttribute('rx', String(radius));
    });
  };
  apply();
  const ro = new ResizeObserver(apply);
  ro.observe(svg);
  return () => ro.disconnect();
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Görünür olduğunda çalışan, görünmezken duran döngü yardımcısı. */
export function whenVisible(el: Element, cb: (visible: boolean) => void, rootMargin = '0px') {
  const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}
