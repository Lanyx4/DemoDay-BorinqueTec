/* ==========================================================================
   BorinqueTec · Demo Day — Comportamiento de la página
   --------------------------------------------------------------------------
   Contenido:
     1. Menú móvil
     2. Enlace activo según la sección visible
     3. Proyecciones financieras (datos + pestañas + gráfica)
   No usa librerías externas.
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. MENÚ MÓVIL
   Abre y cierra la lista de enlaces y mantiene aria-expanded actualizado.
   -------------------------------------------------------------------------- */
(function initMenu() {
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.getElementById('menu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));

  // Al tocar un enlace del menú, se cierra
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') setOpen(false);
  });
})();


/* --------------------------------------------------------------------------
   2. ENLACE ACTIVO
   Resalta en la barra la sección que está en pantalla.
   -------------------------------------------------------------------------- */
(function initActiveLink() {
  const links    = document.querySelectorAll('.nav__links a');
  const sections = [...links]
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) =>
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id)
      );
    });
  }, { rootMargin: '-45% 0px -50% 0px' });   // la sección "activa" es la del centro de la pantalla

  sections.forEach((s) => observer.observe(s));
})();


/* --------------------------------------------------------------------------
   3. PROYECCIONES FINANCIERAS
   Fuente de los datos: presentación Demo Day (diapositivas 7, 8 y 9).
   - ingresos / costos / utilidad: totales anuales en dólares
   - margen: texto tal como aparece en la presentación
   - meses: ingresos mensuales, de enero a diciembre
   -------------------------------------------------------------------------- */
const DATA = {
  1: {
    ingresos: 131400, costos: 106108, utilidad: 25292, margen: '19.2%',
    supuestos: 'Supuestos: ventas de $131,400 (Año 1), 6 meses estables y +15% mensual (meses 7-12). Costos = costo de ventas + gastos operacionales (incl. depreciación de $16,320/año).',
    meses: [8178, 8178, 8178, 8178, 8178, 8178, 9405, 10816, 12438, 14304, 16450, 18919]
  },
  2: {
    ingresos: 173400, costos: 134178, utilidad: 39222, margen: '22.62%',
    supuestos: 'Supuestos: ventas de $173,400 (Año 2), 6 meses estables y +15% mensual (meses 7-12). Costos = costo de ventas + gastos operacionales (incl. depreciación de $16,320/año).',
    meses: [10792, 10792, 10792, 10792, 10792, 10792, 12411, 14273, 16414, 18876, 21707, 24967]
  },
  3: {
    ingresos: 218760, costos: 187828, utilidad: 30932, margen: '14.14%',
    supuestos: 'Supuestos: ventas de $218,760 (Año 3), 6 meses estables y +15% mensual (meses 7-12). Costos = costo de ventas + gastos operacionales (incl. depreciación de $16,320/año).',
    meses: [13616, 13616, 13616, 13616, 13616, 13616, 15658, 18007, 20708, 23814, 27386, 31491]
  }
};

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Escala común: todas las gráficas usan el mes más alto de los tres años
const MAX_MES = Math.max(...Object.values(DATA).flatMap((y) => y.meses));

/** Da formato de dinero: 131400 -> "$131,400" */
const money = (n) => '$' + n.toLocaleString('en-US');

/** Escribe texto en un elemento por su id. */
const setText = (id, value) => { document.getElementById(id).textContent = value; };

/** Pinta indicadores, supuestos y barras del año indicado. */
function renderYear(year) {
  const d = DATA[year];

  setText('supuestos', d.supuestos);
  setText('kpi-ing', money(d.ingresos));
  setText('kpi-cos', money(d.costos));
  setText('kpi-uti', money(d.utilidad));
  setText('kpi-mar', d.margen);

  const bars = document.getElementById('bars');
  bars.innerHTML = '';
  d.meses.forEach((valor, i) => {
    const bar = document.createElement('div');
    // Meses 1-6 (estables) en rojo; meses 7-12 (crecimiento) en verde, como en la presentación
    bar.className = 'bar ' + (i < 6 ? 'bar--red' : 'bar--green');
    bar.style.setProperty('--h', ((valor / MAX_MES) * 100).toFixed(1) + '%');
    bar.innerHTML = `<em>${money(valor)}</em><span>${MESES[i]}</span>`;
    bars.appendChild(bar);
  });
}

/** Conecta las pestañas Año 1 / 2 / 3 (clic y flechas del teclado). */
(function initTabs() {
  const tabs  = [...document.querySelectorAll('.tabs__btn')];
  const panel = document.getElementById('panel-finanzas');

  function select(tab) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    renderYear(tab.dataset.year);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });

  renderYear(1);   // vista inicial
})();
