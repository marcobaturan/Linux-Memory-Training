# Documentación Técnica - Linux Memory Training

Este documento detalla el funcionamiento interno y la arquitectura del programa Linux Memory Training.

## 1. Tecnologías Utilizadas
- **Electron**: Framework para aplicaciones de escritorio con tecnologías web.
- **HTML5/CSS3**: Estructura y diseño (Flexbox/Grid).
- **JavaScript (ES6+)**: Lógica de aplicación.
- **IPC (Inter-Process Communication)**: Comunicación segura entre el proceso principal de Node.js y el renderizador del navegador.

## 2. Flujo de Datos
El programa opera mediante un sistema de estados:
- `IDLE`: Estado inicial esperando configuración.
- `MEMORIZING`: Las imágenes se muestran y el cronómetro de memorización está activo.
- `SELECTING`: Las imágenes se ocultan y el usuario debe reconstruir la rejilla.
- `VALIDATED`: Se comparan los resultados y se muestra la puntuación final.

## 3. Módulos Principales

### Proceso Principal (`main.js`)
Lleva el control de la ventana y la carga de archivos del sistema.
- `ipcMain.handle('get-themes')`: Escanea la carpeta `temas` y devuelve los nombres de las carpetas.
- `ipcMain.handle('get-images')`: Lee archivos de imagen (`.png`, `.jpg`, etc.), los convierte a Base64 y los devuelve mezclados mediante el algoritmo Fisher-Yates.

### Renderizador (`app.js`)
Gestiona la interfaz de usuario y la lógica del juego.
- `init()`: Carga temas y restaura preferencias.
- `setLanguage(lang)`: Cambia dinámicamente el idioma recorriendo el DOM.
- `startGame()`: Inicia la sesión de juego.
- `openSelection(cell)`: Abre el overlay con la matriz de imágenes (filtrada solo por las imágenes usadas en la sesión actual para mayor eficiencia).

### Internacionalización (`translations.js`)
Contiene un objeto JSON con las claves de texto para Español, Esperanto e Inglés. Facilita la expansión a otros idiomas.

## 4. Persistencia
Se utiliza `localStorage` del navegador para guardar:
- `lastTheme`: El último tema seleccionado.
- `appLang`: El idioma preferido del usuario.

## 5. Portabilidad del Lanzador
El archivo `.desktop` utiliza el comando `sh -c 'cd "$(dirname "%k")" && npm start'`. 
- `%k` devuelve la ruta absoluta del archivo `.desktop`.
- Esto permite que el lanzador funcione sin importar dónde esté instalada la carpeta del proyecto.
