const rail = document.querySelector('.screens');
const viewer = document.querySelector('.viewer');

if (rail && viewer) {
  const arrows = [...document.querySelectorAll('[data-scroll]')];
  const shots = [...rail.querySelectorAll('.shot')];
  let enlarged = viewer.querySelector('img');
  let outgoing;
  const caption = viewer.querySelector('.viewer-caption');
  const close = viewer.querySelector('.viewer-close');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let trigger;
  let opening;
  let closing = false;
  const pageMotion = { duration: 190, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'both' };
  const pageRest = { transform: 'translate3d(0,0,0)', opacity: 1 };

  async function closeViewer() {
    if (closing || !viewer.open) return;
    closing = true;
    opening?.cancel();
    if (!motion.matches) {
      const exit = viewer.animate([pageRest, { transform: 'translate3d(16%,0,0)', opacity: 0 }], pageMotion);
      const underneath = document.querySelector('main').animate([
        { transform: 'translate3d(-4%,0,0)', opacity: .94 }, pageRest,
      ], pageMotion);
      await exit.finished.catch(() => {});
      viewer.close();
      exit.cancel();
      underneath.cancel();
    } else {
      viewer.close();
    }
    closing = false;
  }

  function updateArrows() {
    arrows[0].disabled = rail.scrollLeft <= 2;
    arrows[1].disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
  }

  function show(index, direction = 0) {
    current = (index + shots.length) % shots.length;
    const shot = shots[current];
    const image = shot.querySelector('img');
    outgoing?.remove();
    outgoing = undefined;
    if (direction && !motion.matches) {
      enlarged.getAnimations().forEach((animation) => animation.cancel());
      const previous = enlarged;
      enlarged = previous.cloneNode(false);
      previous.after(enlarged);
      previous.setAttribute('aria-hidden', 'true');
      outgoing = previous;
      const options = { duration: 340, easing: 'cubic-bezier(.22,.75,.25,1)' };
      const exit = previous.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(' + (-direction * 100) + '%)', opacity: .35 },
      ], { ...options, fill: 'forwards' });
      exit.onfinish = () => {
        previous.remove();
        if (outgoing === previous) outgoing = undefined;
      };
      enlarged.animate([
        { transform: 'translateX(' + (direction * 100) + '%)', opacity: .35 },
        { transform: 'translateX(0)', opacity: 1 },
      ], options);
    }
    enlarged.src = image.src;
    enlarged.alt = image.alt;
    caption.textContent = shot.dataset.caption + ' · ' + (current + 1) + ' of ' + shots.length;
  }

  function move(direction) {
    show(current + direction, direction);
  }

  for (const button of arrows) {
    button.onclick = () => rail.scrollBy({
      left: Math.round(rail.clientWidth * 0.8) * Number(button.dataset.scroll),
      behavior: motion.matches ? 'instant' : 'smooth',
    });
  }

  rail.addEventListener('scroll', updateArrows, { passive: true });
  new ResizeObserver(updateArrows).observe(rail);
  updateArrows();
  shots.forEach((button, index) => button.addEventListener('click', () => {
    trigger = button;
    show(index);
    viewer.showModal();
    if (!motion.matches) {
      opening = viewer.animate([{ transform: 'translate3d(16%,0,0)', opacity: .82 }, pageRest], pageMotion);
      const animation = opening;
      const underneath = document.querySelector('main').animate([{ opacity: 1 }, { opacity: 0 }], pageMotion);
      void animation.finished.catch(() => {}).then(() => {
        animation.cancel();
        underneath.cancel();
      });
    }
    close.focus();
  }));

  viewer.querySelectorAll('[data-step]').forEach((button) => {
    button.onclick = () => move(Number(button.dataset.step));
  });
  close.onclick = closeViewer;
  viewer.addEventListener('cancel', (event) => {
    event.preventDefault();
    void closeViewer();
  });
  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) void closeViewer();
  });
  const stage = viewer.querySelector('.viewer-body');
  let swipe;
  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch' || event.target.closest('button')) return;
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointerup', (event) => {
    if (swipe?.id !== event.pointerId) return;
    const x = event.clientX - swipe.x;
    const y = event.clientY - swipe.y;
    if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.4) move(x < 0 ? 1 : -1);
    swipe = undefined;
  });
  stage.addEventListener('pointercancel', () => { swipe = undefined; });
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  viewer.addEventListener('close', () => trigger?.focus({ preventScroll: true }));
}
