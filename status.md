# Estado del Proyecto: Attrad

## Objetivo
Plataforma B2B Multi-tenant de Inteligencia de Atribución de Anuncios ("First-Touch Attribution"). Permite a empresas de marketing supervisar qué anuncio exacto (de Meta, Google, TikTok) trajo a cada comprador o cliente final de sus cuentas, protegiendo así los anuncios rentables y demostrándolo de forma transparente.

## Arquitectura de Niveles de Acceso

### Nivel 1: Super Admin (Dueño de la plataforma)
- Panel de gestión de Empresas de Marketing (alta, suspensión, credenciales asignadas).
- Métricas de MRR, empresas activas y suspendidas.
- Botón de "Inspeccionar" para ver el dashboard de cualquier agencia.

### Nivel 2: Usuarios — Empresas de Marketing
- Acceso vía pantalla de Login con credenciales asignadas por el Super Admin.
- Panel "Mis Clientes" (ClientSpacesHub): Tarjetas visuales de cada cliente gestionado.
- Cada tarjeta muestra métricas del cliente y las cuentas publicitarias conectadas (Meta, Google, TikTok).
- Selector rápido de cliente activo en el Navbar para alternar en 1 clic.

### Nivel 3: Clientes Finales (No tienen acceso al sistema)
- Sus datos y conversiones son rastreados internamente dentro de cada Espacio de Cliente.
- La agencia puede generar un Reporte Ejecutivo imprimible/exportable para compartirles métricas.

## Último Implementado (Sesión 2)
- **Sistema de Login/Autenticación**: `LoginView.tsx` con credenciales para Super Admin y Empresas de Marketing. Detección de suspensión en login.
- **Nuevo Modelo de Datos**: `MarketingAgency`, `ClientSpace` (con `connectedNetworks` y `networkAccounts`), `AdItem` y `Lead` vinculados a `clientSpaceId`.
- **AttradContext.tsx**: Reescrito con `login`, `logout`, `switchRoleQuickDemo`, gestión de agencias y espacios de clientes, filtrado de anuncios y leads por cliente activo.
- **mockData.ts**: 3 agencias, 4 espacios de clientes (Inmobiliaria, Dental, Joyería, Cloud), anuncios y compradores finales con atribución First-Touch correctamente vinculada.
- **ClientSpacesHub.tsx**: Hub visual de clientes con tarjetas de métricas, badges de redes conectadas, modal de creación y edición de cuentas publicitarias.
- **AdHub.tsx**: Actualizado con filtrado por cliente activo, lista desplegable de compradores cerrados por cada anuncio y botón de Reporte.
- **PipelineKanban.tsx**: Actualizado con filtrado por cliente activo, badge de atribución (miniatura del anuncio + nombre) en cada tarjeta y modal Dossier de Atribución First-Touch.
- **ClientReportModal.tsx**: Reporte ejecutivo imprimible con desglose de anuncios → ventas cerradas → compradores atribuidos.
- **Navbar.tsx**: Selector visual de cliente activo (Client Switcher), botón de Reporte, selector de rol para testing y botón de Cerrar Sesión.
- **App.tsx**: Flujo de autenticación completo: Login → Dashboard de Empresa de Marketing → Hub de Clientes / Anuncios / Pipeline.
- **Chat**: Retirado temporalmente de la interfaz.
- **Verificación**: `tsc --noEmit` ✅ 0 errores | `npm run build` ✅ código 0.

## Último Implementado (Sesión Actual)
- **Perfeccionamiento Completo del Frontend para Lanzamiento Público**:
  - **Portal Magic Link (`MagicLinkPortal.tsx`)**:
    - Pestañas de filtrado por estado con contadores en tiempo real (Todos, 🔵 Nuevos, 🟡 Citas, 🟢 Ventas, ⚪ Descartados).
    - Filtro por rango temporal (Todo el historial, Hoy, Últimos 7 días, Últimos 30 días) y buscador en vivo con botón de limpieza.
    - Modal de registro manual (`+ Nuevo Registro`) para que la recepcionista registre pacientes/compradores en mostrador o WhatsApp y atribuya anuncios o tráfico orgánico.
    - Modal Dossier de Atribución First-Touch con auditoría de parámetros UTMs, campaña, red y enlace directo a WhatsApp.
    - Modal de cierre de venta en 2 clics con atajos rápidos de montos ($50, $150, $300, $500, $1200, $2500) y registro de notas del tratamiento.
    - Exportación instantánea a CSV de todos los prospectos y ventas atribuidas.
    - Alternador de vista responsiva (Tabla detallada y Tarjetas móviles táctiles).
    - Copia de enlace directo del portal para recepción.
  - **Barra de Navegación Principal (`Navbar.tsx`)**:
    - Rediseño estético Dark Luxury Glassmorphism.
    - Integración de pestaña central **Atribución & ROI** (`roi`) conectada con `AgencyROIHub`.
    - Selector activo de espacio de cliente con logos y categorías.
    - Eliminación de cajas toscas de depuración; reemplazado por Menú de Usuario / Perfil profesional con avatar, cambio de roles en 1 clic, restauración de datos demo y cierre de sesión.
    - Cajón de navegación móvil (Hamburger Drawer) para perfecta compatibilidad con teléfonos y tablets.
  - **Pantalla de Inicio / Acceso Público (`LoginView.tsx`)**:
    - Acceso instantáneo en 1 clic para visitantes públicos (Nexus Media, Super Admin, Agencia Suspendida) sin necesidad de tipear.
    - Enlaces directos a pruebas externas (Magic Link de cliente y simulación de anuncios).
  - **Infraestructura de Despliegue en Vercel (`vercel.json`)**:
    - Reglas de reescritura SPA para rutas limpias, preservando `/test-landing.html` y el SDK `/sdk/attrad.min.js`.
- **Verificación Técnica**:
  - `tsc --noEmit`: 0 errores.
  - `npm run build`: 1601 módulos transformados, 0 errores, compilación lista en `dist/`.

## Estado de Credenciales de Demo
| Rol | Email | Contraseña |
|-----|-------|-----------|
| Super Admin | admin@attrad.com | AdminMaster2026* |
| Agencia Nexus (activa) | nexus@agencymedia.com | NexusMedia2026* |
| Agencia Vanguard (activa) | sofia@vanguardlab.com | VanguardPass2026! |
| Agencia Alpha (suspendida) | martin@alphabrand.io | AlphaAgency2026# |

## Servidor
- Dev activo en: **http://localhost:5173/**

## Estado Actual y Plan de Ejecución Técnico (MVP)

### Definiciones Clave Acordadas e Implementadas:
- **Stack Técnico**: PLAN B (Frontend en Vite + React 18 + TS; Backend en Supabase PostgreSQL + RLS + Edge Functions).
- **Estilo Visual**: Mantenimiento del estilo visual actual intacto (rediseño estético postergado para etapa previa al lanzamiento).
- **Modelo de Atribución**: *First-Touch* estricto con ventana de 30 días.
- **Magic Link (`secure_token`)**: Permanente para el cliente final, revocable/regenerable por la agencia en 1 clic.
- **Captura WhatsApp**: Atribución silenciosa (Visitor ID + UTMs + timestamp con `sendBeacon`) e inyección automática del código dinámico `[Ref: #XXX]` en el chat de WhatsApp.
- **Panel Agencia**: Vista dual con tarjetas de clientes (Magic Links y SDK) + Pestaña central de Control de Atribución ROI.

### Fases de Ejecución Completadas:
- [x] **Fase 1**: Base de Datos y Aislamiento Multi-Tenant (`001_initial_schema.sql` con RLS, `.env.example`, `database.ts` con tipado estricto).
- [x] **Fase 2**: Ingesta y Lógica de Negocio (Edge Function `capture-lead/index.ts` + motor reactivo `attributionStore.ts` con persistencia híbrida).
- [x] **Fase 3**: Frontend SDK ~3 KB (`attrad.js`, `attrad.min.js` con inyector dinámico de Ref Code a WhatsApp + landing interactivo `test-landing.html`).
- [x] **Fase 4**: Interfaces de Usuario (`MagicLinkPortal.tsx` con acción de 2 clics para confirmar ventas y $ + `AgencyROIHub.tsx` con cruce ROI de anuncios vs ventas y alta de clientes).
- [x] **Validación Técnica**: `tsc --noEmit` y `npm run build` ✅ **0 errores** (1600 módulos transformados, código de salida 0).

## Enlaces Rápidos de Prueba en Servidor Local (http://localhost:5173/)
1. **Magic Link de Recepción (Clínica Sonrisas)**: `http://localhost:5173/?token=tok_sonrisas_8f14b2`
2. **Landing de Prueba de Captura**: `http://localhost:5173/test-landing.html`
3. **Panel de Agencia**: `http://localhost:5173/` (Login: `nexus@agencymedia.com` / `NexusMedia2026*`)
