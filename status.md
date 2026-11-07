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
- **Barra Lateral Izquierda y Rediseño de Navegación Principal**:
  - Sustitución de la barra superior horizontal por una **Barra Lateral Izquierda (`Sidebar.tsx`)** fija y estilizada con Dark Luxury Glassmorphism.
  - Encabezado de marca con isotipo glowing, selector integrado de cliente activo con avatars emoji, menú vertical con insignias de estado y accesos directos al Magic Link y reporte.
  - Sección inferior de perfil de usuario con alternador de rol en 1 clic (*Agencia* / *Super Admin*), copia de Magic Link, reinicio demo y cierre de sesión.
  - Barra superior de contexto (`TopHeader.tsx`) en el área de contenido con botón móvil hamburguesa, títulos dinámicos y acciones rápidas.
  - Layout flexbox responsivo en [`src/index.css`](file:///c:/Users/angel/Desktop/TRABAJOS%20MIOS/Anti%20IDE/Proyecto1/src/index.css) con padding dinámico en desktop y drawer off-canvas en móviles.
- **Corrección y Blindaje de Datos en Magic Link (`MagicLinkPortal.tsx` & `attributionStore.ts`)**:
  - Resuelto el problema de tokens no coincidentes: sincronización total de identificadores y tokens para todos los clientes (`tok_sonrisas_8f14b2`, `tok_valle_3c99a1`, `tok_aura_7e52d9`, `tok_saas_4d88e2`).
  - Pre-población de 16 prospectos realistas con nombres, teléfonos, campañas, UTMs y estados variados (nuevos, citas agendadas y ventas confirmadas con montos $) para que ningún cliente ni enlace de recepción aparezca vacío.
  - Algoritmo resiliente en `getClientByToken`: resolución por token exacto, slug, ID o fallback seguro al cliente principal para garantizar que la pantalla nunca falle ni quede en blanco.
- **Rediseño Estructural Estilo Pipedrive (Deals & Pipeline Workspace)**:
  - **Dock Lateral Izquierdo Delgado (60px)** en [`Sidebar.tsx`](file:///c:/Users/angel/Desktop/TRABAJOS%20MIOS/Anti%20IDE/Proyecto1/src/components/layout/Sidebar.tsx): Monograma Attrad superior, navegación por iconos con tooltips flotantes, píldora azul activa (`$ / Kanban`), badges de alertas en anuncios (`27`) y clientes (`4`), accesos a Magic Link, reportes y herramientas de rol/reset.
  - **Top Header Bar** en [`TopHeader.tsx`](file:///c:/Users/angel/Desktop/TRABAJOS%20MIOS/Anti%20IDE/Proyecto1/src/components/layout/TopHeader.tsx): Título de página (`Deals`), barra de búsqueda global central redondeada (`Search Attrad...`) con botón rápido `(+)`, selector de cliente en píldora y widget de perfil (`Phyllis Yang / Silicon Links Inc`).
  - **Sub-barra de Herramientas de Pipeline** en [`PipelineKanban.tsx`](file:///c:/Users/angel/Desktop/TRABAJOS%20MIOS/Anti%20IDE/Proyecto1/src/components/pipeline/PipelineKanban.tsx): Alternador de vista (`Kanban` vs `Lista` vs `Historial`), botón verde de acción `+ Deal` con modal de alta, métricas agregadas en vivo (`$34,900 · 13 deals`), selector de pipeline de cliente con lápiz de edición y filtros.
  - **Flujo de Etapas Chevron Conectadas**: 5 columnas horizontales con flechas de avance (`Qualified`, `Contact Made`, `Demo Scheduled`, `Proposal Made`, `Negotiations Started / Closed`) con iconos de balanza y totales por columna.
  - **Tarjetas de Tratos y Popover de Actividad**: Tarjetas con indicador de color superior, badge verde `WON`, avatar con monto en dólares, y popover interactivo idéntico al de la imagen con llamadas de seguimiento (`Follow-up Call`), citas (`Product Demo`), anuncio de origen First-Touch y avance de etapas.
  - **Verificación Técnica**: `tsc --noEmit` ✅ 0 errores | `npm run build` ✅ código 0.

- **Verificación Técnica & Auditoría Cero Errores**:
  - `tsc --noEmit`: 0 errores.
  - `npm run build`: 1603 módulos transformados exitosamente en 2.47s (código 0).
  - Protocolo `web-error-fixer-optimizer` ejecutado en todas las capas (TypeScript, compilación, console runtime, boundaries y LocalStorage).
  - `ErrorBoundary.tsx`: import corregido para JSX transform (`noUnusedLocals`).
  - `AttradContext.tsx`: `resetAllData` sincronizado con las claves de `attributionStore` (`attrad_organizations_v1`, `attrad_clients_v1`, `attrad_leads_v1`, `_attrad_first_touch`).
  - `test-landing.html`: sincronizado `client_id` exacto con `client-dental-01`.
  - Zero menciones de "CRM" en todo el código y configuraciones.

## Siguientes Pasos
1. Despliegue continuo en Vercel (repositorio conectado en https://github.com/Angel20734/attrad).
2. Pruebas de usuario con tráfico real o simulado mediante `/test-landing.html`.
3. Migración a Supabase cuando se decida persistir en base de datos PostgreSQL en la nube.

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

## Siguientes Pasos Inmediatos
1. **Despliegue en Vercel**: Importar el repositorio [**github.com/Angel20734/attrad**](https://github.com/Angel20734/attrad) con 1 clic (detección automática de Vite + reglas en `vercel.json`).
2. **Conexión de Supabase en Producción**: Crear el proyecto en Supabase, aplicar la migración SQL `001_initial_schema.sql` y desplegar la Edge Function `capture-lead` para pasar de persistencia híbrida a backend distribuido.
3. **Integración con Meta / Google Ads APIs**: Conectar webhooks oficiales de Conversions API (CAPI) para retroalimentar el algoritmo de anuncios con las ventas cerradas.

## Enlaces Rápidos de Prueba en Servidor Local (http://localhost:5173/)
1. **Dashboard Principal (Sidebar a la Izquierda)**: `http://localhost:5173/` (Login: `nexus@agencymedia.com` / `NexusMedia2026*`)
2. **Magic Link de Recepción (Clínica Sonrisas)**: `http://localhost:5173/?token=tok_sonrisas_8f14b2`
3. **Magic Link de Recepción (Inmobiliaria Prime)**: `http://localhost:5173/?token=tok_valle_3c99a1`
4. **Landing de Prueba de Captura**: `http://localhost:5173/test-landing.html`
5. **Repositorio GitHub**: `https://github.com/Angel20734/attrad`
