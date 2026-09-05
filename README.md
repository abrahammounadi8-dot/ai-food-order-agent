# AI Food Order Agent

Aplicación web simple para crear pedidos de comida con un agente de IA.

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Añade tu `OPENAI_API_KEY` en `.env`.

> Si no configuras clave, la app responde con modo fallback local.

## Ejecutar

```bash
npm start
```

Abre: `http://localhost:3000`

## API

`POST /api/order`

Body:

```json
{
  "order": "Quiero una pizza grande con bebida"
}
```