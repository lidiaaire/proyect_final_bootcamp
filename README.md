# Flowly - Sistema de Gestión de Autorizaciones

## 📌 Descripción

Flowly es una aplicación fullstack diseñada para gestionar solicitudes
de autorización médica con un flujo de estados bien definido, roles
diferenciados y trazabilidad completa.

---

## 🧱 Arquitectura

### Backend

- Node.js + Express
- MongoDB (base de datos: **flowly**)

### Frontend

- Next.js
- Consumo de API REST

---

## ⚙️ Instalación

### 1. Clonar repositorio

    git clone <repo>
    cd proyect_final_bootcamp-main

---

## 🚀 Backend

    cd back
    npm install

Crear `.env`:

    PORT=4000
    MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/flowly?retryWrites=true&w=majority
    JWT_SECRET=secret

> Sustituir USER y PASSWORD por credenciales reales.

---

## 🌱 Seeds

    node scripts/seedAll.cjs

---

## ▶️ Arrancar backend

    npm start

---

## 💻 Frontend

    cd front
    npm install
    npm run dev

---

## 🌐 API

Prefijo: `/api`

---

## 📌 Notas

Proyecto preparado para ejecutarse en cualquier entorno con MongoDB
Atlas.
