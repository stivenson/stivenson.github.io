import { Link } from 'react-router-dom';

const regions = [
  { id: '01', label: 'IA y agentes', note: 'LLMOps · ML', to: '/portfolio', side: 'northwest' },
  { id: '02', label: 'Full stack', note: 'Productos · Cloud', to: '/resume', side: 'northeast' },
  { id: '03', label: 'Ciencia de datos', note: 'Modelos · Datos', to: '/articles', side: 'west' },
  { id: '04', label: 'Investigación', note: 'Maestría en IA', to: '/articles', side: 'east' },
  { id: '05', label: 'Educación', note: 'Recursos · Guías', to: '/portfolio', side: 'southwest' },
  { id: '06', label: 'Open source', note: 'Código público', href: 'https://github.com/stivenson', side: 'southeast' },
];

export function ProfessionalAtlas() {
  return (
    <section className="professional-atlas" aria-label="Mapa de áreas profesionales">
      <div className="atlas-heading">
        <div>
          <span className="atlas-kicker">MAPA DE EXPLORACIÓN</span>
          <h2>Regiones de trabajo</h2>
        </div>
        <span className="atlas-coordinate">8° N · 72° O</span>
      </div>

      <div className="atlas-map">
        <svg className="atlas-landscape" viewBox="0 0 700 430" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <linearGradient id="atlas-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#243c2c" />
              <stop offset="1" stopColor="#13251c" />
            </linearGradient>
            <linearGradient id="atlas-route" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d7b67d" stopOpacity=".2" />
              <stop offset=".5" stopColor="#9fc99f" stopOpacity=".8" />
              <stop offset="1" stopColor="#d7b67d" stopOpacity=".28" />
            </linearGradient>
          </defs>
          <path className="atlas-continent" d="M75 205 111 143 166 122 194 78 251 91 290 62 351 82 390 61 430 91 485 88 523 126 581 140 604 184 575 220 596 258 560 291 533 339 476 335 440 367 382 350 337 381 287 352 237 371 211 328 160 324 143 284 95 266Z" />
          <path className="atlas-contour" d="M109 210c25-77 90-112 148-113 67-2 82-34 142-15 51 16 69 52 128 57 37 4 55 30 48 59-8 31-43 37-50 74-8 39-39 54-78 45-43-10-57 24-101 30-45 6-64-23-100-21-43 2-61-22-67-55-5-26-50-26-70-61Z" />
          <path className="atlas-contour" d="M153 210c20-52 65-79 109-78 47 1 72-28 119-13 37 12 49 39 98 44 31 3 40 20 34 41-7 24-33 32-38 60-5 28-29 37-58 30-34-9-49 18-81 22-32 4-46-17-73-16-32 2-46-15-51-40-4-20-41-22-59-50Z" />
          <path className="atlas-contour" d="M208 211c15-32 41-48 73-46 34 2 52-20 86-10 26 8 36 27 69 30 21 2 28 12 23 27-5 16-25 22-29 41-4 18-20 24-41 19-23-6-35 12-57 14-22 2-32-11-50-10-22 1-32-10-36-27-3-13-28-14-38-38Z" />
          <path className="atlas-route-path" d="M153 145c71 25 81 81 141 72s77-65 142-49 64 83 111 88M144 282c64-30 91-10 150-65s93-27 133 28 68 64 119 45" />
          <path className="atlas-route-path atlas-route-path--secondary" d="M190 112c-9 76 39 92 56 139s-5 78 18 113M492 108c-32 41-39 81-21 124s-7 74-24 122" />
          <circle className="atlas-landmark" cx="350" cy="215" r="24" />
          <circle className="atlas-landmark-core" cx="350" cy="215" r="4" />
          <text className="atlas-map-label" x="350" y="254" textAnchor="middle">CÚCUTA · BASE</text>
        </svg>

        {regions.map((region) => {
          const content = (
            <>
              <span className="atlas-region-index">{region.id}</span>
              <span className="atlas-region-copy">
                <strong>{region.label}</strong>
                <small>{region.note}</small>
              </span>
            </>
          );

          return region.href ? (
            <a
              key={region.id}
              className={`atlas-region atlas-region--${region.side}`}
              href={region.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </a>
          ) : (
            <Link key={region.id} className={`atlas-region atlas-region--${region.side}`} to={region.to!}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="atlas-legend">
        <span><i aria-hidden="true" /> 6 áreas conectadas</span>
        <span>Selecciona una región para explorar <b aria-hidden="true">↗</b></span>
      </div>
    </section>
  );
}
