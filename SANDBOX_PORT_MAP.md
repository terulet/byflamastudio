# Mapa de port · Demo estática (byflamastudio) → React Atlas Inbox (atlas-inbox)

> Documento de referencia para portar **Atlas Sandbox** desde la demo estática
> a `atlas-inbox` (React + Vite + Tailwind + LocalStorage), como sección
> integrada en el Sidebar **sin romper Inbox ni Casos**.
>
> Estado: solo planificación. **No commit, no PR, no cambios** hasta tu OK.

---

## 0. Resumen en una frase

La demo estática ya tiene **todos los datos, estados, copys y la UX** resueltos.
Portar = **separar datos / lógica / vista** en módulos React, traducir el CSS a
Tailwind y enganchar una entrada "Sandbox" en el Sidebar existente.

---

## 1. Archivos de la demo estática que sirven como referencia

| Archivo (byflamastudio) | Qué contiene | Para qué lo usarás en el port |
|---|---|---|
| `atlas-sandbox.html` | Estructura/markup de la página: intro, panel de privacidad, selector, métricas, toolbar (botones), workspace (bandeja + panel de caso), toast. | Plantilla del **árbol de componentes** y del orden visual. |
| `sandbox-data.js` | `window.ATLAS_SANDBOX = { channels, tags, businesses }`. 5 negocios con `seeds` (casos) y `pool` (plantillas de simulación), estados por vertical. | Fuente de los **datos** → `src/data/*`. |
| `sandbox.js` | Toda la lógica: estado, LocalStorage, `buildCase`, `loadCases`, `computeMetrics`, `simulateMessages`, render y handlers. | Fuente de la **lógica** → `src/utils/*` + hooks/handlers de los componentes. |
| `sandbox.css` | Estilos (tokens, badges de canal, estados, urgencia, métricas, panel de caso, sugerencias, responsive 375px+). | Tabla de **traducción a Tailwind**. |

> Acceso a la referencia: repo `terulet/byflamastudio`, rama
> `claude/affectionate-curie-ztz02b`.

---

## 2. Componentes React a crear (en `src/components/`)

Árbol propuesto (un contenedor + 5 hijos de presentación):

```
SandboxLab.jsx                 ← contenedor: estado, persistencia, orquestación
├── SandboxPrivacyPanel.jsx    ← bloque "Modo Sandbox seguro"
├── SandboxBusinessSelector.jsx← selector de los 5 verticales
├── SandboxMetrics.jsx         ← 6 métricas (+ cabecera de negocio / dolor)
├── SandboxInbox.jsx           ← filtros + lista de entradas (bandeja)
└── SandboxCasePanel.jsx       ← caso seleccionado + acciones + sugerencias
```

| Componente | Equivale en `sandbox.js` a | Props sugeridas | Estado/responsabilidad |
|---|---|---|---|
| **SandboxLab.jsx** | `state`, `Store`, `loadCases`, `persist`, `render()`, handlers (`selectBusiness`, `selectCase`, `changeStatus`, `simulateMessages`, `resetSandbox`) | — (raíz de la sección) | Dueño del estado: `businessId`, `selectedCaseId`, `filter`, `cases`. Hace persistencia LocalStorage vía `useEffect`. Pasa datos y callbacks a los hijos. Renderiza intro + toolbar (botones "Simular entrada de mensajes" / "Reiniciar") + toast. |
| **SandboxPrivacyPanel.jsx** | bloque `.sbx-privacy` del HTML | `()` (estático) o `{ items }` | Panel "Modo Sandbox seguro" + los 5 puntos. **Sin lógica.** |
| **SandboxBusinessSelector.jsx** | `renderSelector()` | `{ businesses, activeId, onSelect }` | Botones de vertical con marca/iniciales/sector. `aria-pressed`. |
| **SandboxMetrics.jsx** | `renderBusinessHead()` + `renderMetrics()` | `{ business, metrics }` | Cabecera (nombre, sector, dolor) + 6 tarjetas de métricas. Recibe `metrics` ya calculadas (de `computeMetrics`). |
| **SandboxInbox.jsx** | `renderFilters()` + `renderInbox()` + `passesFilter()` | `{ business, cases, filter, selectedCaseId, onFilter, onSelect }` | Filtros (Todos/Urgentes/Para después/Con riesgo/Archivados con contadores) + lista de entradas. Estado vacío decente. |
| **SandboxCasePanel.jsx** | `renderCasePanel()` + `renderSuggestions()` + `fact()` | `{ business, caseItem, onChangeStatus }` | Resumen, datos (cliente/canal/área/urgencia), documentos, **acciones rápidas** (cambiar estado), historial y **Sugerencias Atlas** (bloque plegable secundario con `<details>`/estado local `open`). Estado vacío "Selecciona un mensaje". |

> Subcomponentes opcionales reutilizables (si encajan con tus convenciones):
> `ChannelBadge`, `StatusBadge`, `RiskTag`, `UrgencyDot`. En la demo son las
> funciones `channelBadge`, `tagBadges`, `statusMeta`, `urgencyDot`.

---

## 3. Datos a mover

### `src/data/sandboxBusinesses.js`
De `sandbox-data.js` → exporta la **definición de negocios y catálogos**:

- `CHANNELS` (email, whatsapp, call, web, document → `{ id, label, icon }`).
  - El `icon` en la demo es un *string* de paths SVG. En React conviene un
    pequeño componente `<ChannelIcon name>` o un mapa `id → JSX`.
- `TAGS` (riesgo, sensible, confidencial, plazo, revision → `{ id, label, tone }`).
- `STATUS_SETS` por vertical (estados personalizados con `{ id, label, tone }`).
- `BUSINESSES` **sin** los casos: `{ id, name, short, sector, initials, accent,
  pain, statuses, defaultStatus, avgMinutesSaved }`.

```js
export const CHANNELS = { /* … */ };
export const TAGS = { /* … */ };
export const STATUS_SETS = { /* … */ };
export const BUSINESSES = [ /* 5 negocios, sin seeds/pool */ ];
```

### `src/data/sandboxMessages.js`
De `sandbox-data.js` → exporta los **mensajes/casos** separados de la metadata:

- `SEEDS_BY_BUSINESS`: `{ gestoria: [...], abogados: [...], … }`
  (los `seeds` actuales: `channel, person, area, subject, urgency, status,
  time, tags, snippet, body, history, documents, suggestions`).
- `POOL_BY_BUSINESS`: `{ gestoria: [...], … }`
  (las plantillas `pool` para "Simular entrada de mensajes":
  `channel, person, area, subject, urgency, tags, snippet`).

```js
export const SEEDS_BY_BUSINESS = { /* casos iniciales por vertical */ };
export const POOL_BY_BUSINESS  = { /* plantillas de simulación por vertical */ };
```

> Motivo de la separación: "businesses" = identidad/configuración (cambia poco),
> "messages" = contenido (crece). Coincide con tu estructura `src/data` pedida.

---

## 4. Lógica a mover → `src/utils/sandboxFactory.js`

Portar **como funciones puras** (sin tocar el DOM; el DOM lo hace React):

| Función en `sandbox.js` | En `sandboxFactory.js` | Notas |
|---|---|---|
| `uid(prefix)` | `uid()` | id único para casos simulados. |
| `nowTime()` | `nowTime()` | "HH:MM" para la hora de entrada. |
| `buildCase(business, tpl, opts)` | `buildCase()` | Normaliza una plantilla/seed a un caso completo. |
| `loadCases(businessId)` | `loadCases(businessId, saved)` | Combina seeds + overrides de estado + casos añadidos guardados. Recibe el objeto persistido como parámetro (no lee LocalStorage dentro). |
| `computeMetrics(business, cases)` | `computeMetrics()` | Devuelve `{ ordered, urgent, later, archived, risks, saved }`. **Reutilizar tal cual.** |
| `simulateMessages()` (parte pura) | `makeSimulatedCases(business, count?)` | Devuelve 1–3 casos nuevos desde `pool`. La actualización de estado/toast la hace `SandboxLab`. |
| `Store` (read/write/clear) | `loadState()/saveState()/clearState()` | LocalStorage con `try/catch`, clave namespaced. |

Persistencia recomendada en React:
- Clave: `atlas-sandbox-v1` (igual que la demo; revisa que no colisione con
  claves de Inbox/Casos ya existentes — si hace falta, prefija `atlas-inbox:`).
- Hook propio `useSandboxState()` dentro de `SandboxLab`, o `useEffect` que
  serialice `{ [businessId]: { statuses, added } }`.
- **Guarda solo:** overrides de estado + casos simulados añadidos (no reescribas
  los seeds; se reconstruyen desde `src/data`).

> Reglas de métricas (ya implementadas, mantener):
> - **Urgentes** = `urgency === 'alta'` o estado de tono `urgent`.
> - **Para después** = estado de tono `wait`.
> - **Archivados** = tono `archived`.
> - **Riesgos sin revisar** = caso con tag de riesgo y estado no resuelto
>   (no `done`/`archived`/`review`).
> - **Tiempo ahorrado** = `nº casos × avgMinutesSaved` (formateado a min/h).

---

## 5. Estilos a traducir a Tailwind

La demo usa los tokens de `style.css` de byflamastudio. En atlas-inbox **usa los
tokens/colores que ya tenga el proyecto**; abajo el equivalente conceptual.

### 5.1 Tokens de color (definir en `tailwind.config` o reutilizar los de Inbox)
| Variable demo | Valor ref. | Uso |
|---|---|---|
| `--bg / --bg-2` | `#12100e / #181512` | fondos |
| `--card / --card-2` | `#1f1b17 / #27211b` | tarjetas |
| `--line / --line-strong` | `rgba(229,210,176,.16/.28)` | bordes |
| `--text / --muted / --soft` | `#f4eee4 / #b8ad9e / #8f8578` | texto |
| `--gold / --gold-2` | `#e4cfaa / #b9965d` | acento |

### 5.2 Tonos de estado/badges (mapa de color → clases Tailwind)
| Tono | Color ref. | Clases Tailwind sugeridas (texto/borde/fondo) |
|---|---|---|
| `new` | `#e4cfaa` | `text-amber-200 border-amber-200/35 bg-amber-200/10` |
| `urgent` / `risk` | `#e98a7a` | `text-rose-300 border-rose-400/40 bg-rose-400/10` |
| `wait` / `deadline` | `#e0b063` | `text-amber-400 border-amber-400/40 bg-amber-400/10` |
| `review` | `#7fb2d6` | `text-sky-300 border-sky-400/40 bg-sky-400/10` |
| `done` | `#86c08f` | `text-emerald-300 border-emerald-400/40 bg-emerald-400/10` |
| `archived` | `#8f8578` | `text-stone-400 border-white/10 bg-white/5` |
| `sensible` | `#c79ad6` | `text-purple-300 border-purple-400/40 bg-purple-400/10` |

> Ajusta la paleta a la de Atlas Inbox; lo importante es **mantener la semántica**
> (urgente=rojizo, espera=ámbar, ok=verde, archivado=apagado, sensible=violeta).

### 5.3 Bloques → utilidades Tailwind
| Bloque demo (`sandbox.css`) | Traducción Tailwind (orientativa) |
|---|---|
| `.sbx-workspace` (2 columnas) | `grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-4 items-start` |
| `.sbx-metrics` | `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5` |
| `.sbx-selector` | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5` |
| `.sbx-item` (entrada) | `w-full text-left rounded-2xl p-3.5 border border-transparent hover:bg-white/[.03] hover:border-white/10` + seleccionado `border-amber-200/40 bg-amber-200/10` |
| `.sbx-channel` (badge canal) | `inline-flex items-center gap-1 text-xs font-bold rounded-full border px-2 py-1` |
| `.sbx-status` / `.sbx-tag` | `inline-flex items-center text-[.7rem] font-extrabold rounded-full border px-2 py-1` + tono |
| `.sbx-metric` | `relative rounded-xl border border-white/10 bg-white/[.025] p-4` + barra lateral de tono |
| `.sbx-case-col` | `rounded-2xl border border-white/10 bg-gradient-to-br … p-5 min-h-[420px]` |
| `.sbx-suggestions` (`<details>`) | `<details>` con `summary` o estado `open` + `rounded-2xl border` |
| `.sbx-privacy` | `rounded-2xl border border-emerald-400/30 bg-emerald-400/[.08] p-6` |
| `.sbx-toast` | posicion fija + `fixed bottom-6 left-1/2 -translate-x-1/2` + transición |
| Responsive `@media 920/760/420` | breakpoints `lg: / md: / sm:` ya incluidos arriba; **probar a 375px**. |

---

## 6. Qué NO portar (líneas rojas)

- ❌ **Web3Forms** — ningún formulario de captación.
- ❌ **APIs externas** de cualquier tipo.
- ❌ **Gmail / Outlook / WhatsApp reales** — los canales son etiquetas simuladas.
- ❌ **Lead capture** — nada de recoger datos de personas reales.
- ❌ **Dependencias nuevas** innecesarias (usa React/Tailwind/LocalStorage ya presentes).
- ❌ **Decisiones automáticas / tono chatbot** — Atlas prepara, el profesional decide.
- ❌ **Commit / PR** — no hasta tu revisión explícita.
- ❌ **noindex/nofollow** del HTML estático — no aplica dentro de la app React.
- ⚠️ **No tocar** Inbox ni Casos existentes: la sección Sandbox se añade **al lado**.

---

## 7. Orden recomendado de implementación (en la sesión de atlas-inbox)

> Regla: tras cada paso, `npm run dev` y verificar que **Inbox y Casos siguen
> funcionando**. Sin commit hasta el final y tu OK.

1. **Reconocimiento (sin cambios).** `git status`, `git remote -v`; leer
   `package.json`, `src/App.jsx`, `src/components/`, `src/utils/`, `src/data/`.
   Identificar: cómo se navega (router vs. estado), cómo se pinta el **Sidebar**,
   dónde se montan Inbox/Casos, y los tokens/paleta de Tailwind. → **Pausa y OK.**
2. **Datos.** Crear `src/data/sandboxBusinesses.js` y `src/data/sandboxMessages.js`
   copiando el contenido de `sandbox-data.js` (separando metadata vs. mensajes).
3. **Lógica.** Crear `src/utils/sandboxFactory.js` con las funciones puras
   (`buildCase`, `loadCases`, `computeMetrics`, `makeSimulatedCases`, store).
   Probar con un test rápido en consola/Node si es posible.
4. **Presentación hoja por hoja** (sin estado todavía, con props mock):
   `SandboxPrivacyPanel` → `SandboxBusinessSelector` → `SandboxMetrics` →
   `SandboxInbox` → `SandboxCasePanel`. Traducir estilos a Tailwind.
5. **Contenedor.** Crear `SandboxLab.jsx`: estado (`businessId`, `selectedCaseId`,
   `filter`, `cases`), persistencia LocalStorage, handlers, botones "Simular
   entrada de mensajes" y "Reiniciar", toast. Cablear los hijos.
6. **Integración en Sidebar.** Añadir entrada **"Sandbox"** a la navegación
   existente (mismo patrón que Inbox/Casos) y la ruta/condición que monta
   `SandboxLab`. Verificar que Inbox/Casos no se rompen.
7. **Pulido responsive** (375px), estados vacíos, accesibilidad
   (`aria-pressed`, foco, `aria-live` en el panel de caso).
8. **Build.** `npm run build` y revisar que pasa limpio. Anotar warnings.
9. **Resumen** (archivos creados/modificados, integración en Sidebar, cómo
   probarlo, resultado del build, riesgos). → **Esperar tu OK** para commit/PR.

---

## 8. Checklist de aceptación

- [ ] "Sandbox" visible en el Sidebar; Inbox y Casos intactos.
- [ ] 5 verticales conmutables; bandeja/casos/estados/métricas cambian con cada uno.
- [ ] Bandeja omnicanal con badges de canal, urgencia, estado y riesgo/sensible.
- [ ] Panel de caso: resumen, datos, documentos, historial, acciones de estado.
- [ ] "Simular entrada de mensajes" añade 1–3 casos del vertical activo.
- [ ] Sugerencias Atlas plegables y secundarias ("Requiere revisión profesional").
- [ ] Panel "Modo Sandbox seguro" presente y visible.
- [ ] Métricas calculadas en vivo desde los casos.
- [ ] Persistencia LocalStorage con `try/catch`; botón Reiniciar.
- [ ] Responsive correcto a 375px; estados vacíos decentes.
- [ ] `npm run build` pasa limpio.
- [ ] Sin Web3Forms, sin APIs externas, sin canales reales, sin lead capture.
- [ ] Sin commit ni PR hasta revisión.
```
