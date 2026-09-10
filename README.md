<p align="center">
  <img src="./public/imagenes/logo-codexium.jpg" alt="CODEXIUM" width="160" />
</p>

<h1 align="center">Asogema — Frontend</h1>

<p align="center">
  Aplicación web del club Asogema: hotel, restaurante, eventos, pagos y administración.
</p>

<p align="center">
  <strong>Software Asogema desarrollado por CODEXIUM</strong>
</p>

---

## Tabla de contenido

- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación paso a paso](#instalación-paso-a-paso)
- [Configuración de la API](#configuración-de-la-api)
- [Ejecución](#ejecución)
- [Build de producción](#build-de-producción)
- [Despliegue](#despliegue)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Descripción

Frontend SPA (Single Page Application) de Asogema, construido con **Vue 3 + Vite**. Consume la API del backend [`asogema-back`](https://github.com/Cesarmc-0/asogema-back) e incluye, entre otros:

- Catálogo de hotel, restaurante y eventos.
- Reservas y checkout de pagos (Wompi: tarjeta, Nequi, Daviplata, PSE, saldo).
- Perfil del usuario: reservas, facturas e historial de pagos.
- Billetera (saldo y recargas).
- Panel de administración, empleado, comanda y recepción.
- Lector de códigos QR.

---

## Stack tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | Vue 3 (`<script setup>`) |
| Bundler | Vite 8 |
| HTTP | Axios |
| Tiempo real | Socket.IO Client |
| Animaciones | GSAP |
| QR | qrcode / html5-qrcode |
| Servidor de producción | Nginx (Docker) |

---

## Requisitos previos

- **Node.js 20+**
- **npm** (o pnpm/yarn)
- Backend **asogema-back** corriendo (local o remoto)

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/MaicOl2007gfd/asogema_front.git
cd asogema_front
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la API

Edita [`src/config.js`](./src/config.js) para apuntar al backend correspondiente (ver siguiente sección).

---

## Configuración de la API

Las URLs del backend se definen en [`src/config.js`](./src/config.js) y cambian según el entorno:

```js
export const API_URL = import.meta.env.PROD
  ? 'https://api.clubasogema.com'   // producción
  : 'http://localhost:3000'          // desarrollo

export const WS_URL = import.meta.env.PROD
  ? 'wss://api.clubasogema.com'      // producción (WebSockets)
  : 'ws://localhost:3000'            // desarrollo
```

- En **desarrollo** apunta a `http://localhost:3000` (el backend local).
- En **producción** apunta a `https://api.clubasogema.com`.

Si tu backend está en otra dirección, ajusta estos valores.

---

## Ejecución

```bash
# Servidor de desarrollo (http://localhost:5173)
npm run dev
```

Asegúrate de que el backend esté corriendo y que su CORS permita el origen del frontend (`http://localhost:5173`).

---

## Build de producción

```bash
npm run build      # genera la carpeta dist/
npm run preview    # sirve el build localmente para verificar
```

---

## Despliegue

El despliegue a producción es automático mediante GitHub Actions (`.github/workflows/cd.yml`) al hacer merge a `main`. El frontend se empaqueta con Docker (build de Vite + Nginx) y se publica a través de un túnel de Cloudflare.

---

## Estructura del proyecto

```
asogema_front/
├── public/
│   ├── imagenes/
│   │   └── logo-codexium.jpg     # Logo de CODEXIUM
│   ├── videos/
│   └── favicon.svg
├── src/
│   ├── components/               # Vistas y componentes Vue
│   ├── composables/              # Lógica reutilizable (API, estado, sockets)
│   ├── config.js                 # URLs de API y WebSockets
│   └── App.vue                   # Navegación entre vistas
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Licencia

Software propietario de **Asogema**. Desarrollado por **CODEXIUM**.

<p align="center">
  <sub>Hecho con dedicación por CODEXIUM</sub>
</p>
