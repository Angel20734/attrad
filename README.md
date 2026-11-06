# Attrad - Marketing & First-Touch Ad Attribution Platform

Attrad es una plataforma B2B Multi-tenant diseñada para resolver la fuga de atribución en marketing digital. Permite a dueños de negocios vincular conversaciones de ventas y contratos cerrados con el anuncio exacto (Facebook, Instagram, TikTok o Google) que originó el primer contacto del cliente, asegurando decisiones de optimización precisas mediante el motor inteligente "Ad Guardian".

## Características Principales

- **Arquitectura Multi-tenant**: Separación de datos por empresa cliente con gestión centralizada desde el panel de Super Admin.
- **Atribución de Primer Contacto (First-Touch)**: Dossier en tiempo real dentro del chat con la miniatura, titular, plataforma y campaña del anuncio de origen.
- **Bandeja de Entrada Estilo WhatsApp**: Chat con plantillas de respuestas rápidas y seguimiento de antigüedad del lead (tiempo desde primer contacto y tiempo desde contrato).
- **Hub Multicanal de Supervisión de Anuncios**: Rankings de efectividad por red (Facebook, Instagram, TikTok, Google) con enlaces directos para ver el anuncio en vivo y días de circulación.
- **Ad Guardian**: Alertas inteligentes preventivas sobre anuncios de alto rendimiento para evitar cancelaciones accidentales.
- **Pipeline Comercial**: Embudo con registro de montos ($) y cálculo automático de ROAS comercial por creativo.

## Comandos Rápidos

### Instalación de Dependencias
```bash
npm install
```

### Modo Desarrollo
```bash
npm run dev
```

### Compilación y Verificación de Tipos
```bash
npm run build
```
O validación estricta de TypeScript:
```bash
npx tsc --noEmit
```
