# Linux Memory Training

Una aplicación de escritorio potente e interactiva construida con **Electron** diseñada para entrenar la memoria visual. Este software es **gratuito y de código abierto (Open Source)**.

## 🚀 Instalación y Uso

### Prerrequisitos
Debes tener instalado **Node.js** y **npm** en tu sistema Linux.

### Instalación
1. Descarga o clona este repositorio.
2. Abre una terminal en la carpeta del proyecto.
3. Ejecuta el siguiente comando para instalar las dependencias:
   ```bash
   npm install
   ```

### Ejecución
Para iniciar el programa:
```bash
npm start
```

## 🖥️ Lanzador de Escritorio

El proyecto incluye un lanzador portátil llamado `linux_memory_training.desktop`.

### Cómo ponerlo en tu escritorio:
1. Asegúrate de que el archivo `linux_memory_training.desktop` esté en la carpeta del proyecto.
2. Copia el archivo a tu carpeta de escritorio:
   ```bash
   cp linux_memory_training.desktop ~/Escritorio/
   ```
   *(O arrástralo directamente al escritorio)*.
3. Haz clic derecho sobre el archivo en tu escritorio y selecciona **"Permitir ejecución"** (Allow Launching).
4. ¡Ya puedes abrir el programa con un solo clic! El lanzador detectará automáticamente la ruta del programa.

## 📖 Instrucciones de Juego

1. **Selección de Idioma**: Haz clic en los botones **ES**, **EO** o **EN** en la parte superior izquierda para cambiar el lenguaje.
2. **Configuración**: Elige el número de cajas, el tiempo límite y el tema de imágenes.
3. **Fase de Memorización**: Observa la posición de las imágenes. Si no hay tiempo límite, haz clic en **"Memorizar"** cuando estés listo.
4. **Fase de Selección**: Haz clic en las celdas vacías y elige la imagen correcta de la matriz que aparecerá.
5. **Resultados**: Haz clic en **"Comprobar"** para ver tu puntuación y estadísticas de tiempo.

---

## 🛠️ Arquitectura Técnica

### Componentes
- **main.js**: Proceso principal (lifecycle y acceso a archivos).
- **preload.js**: Puente de seguridad IPC.
- **app.js**: Lógica del juego y renderizado.
- **translations.js**: Diccionario multi-idioma.
- **styles.css**: Sistema de diseño moderno.

### Estructura
```text
/Linux_memory_training
├── main.js         # Proceso Principal
├── preload.js      # Puente de seguridad
├── app.js          # Lógica del juego
├── translations.js # Traducciones
├── styles.css      # Estilos
├── index.html      # Estructura UI
├── icon.png        # Icono de la aplicación
└── /temas          # Almacén de temas
```

## 📜 Licencia
Este proyecto es de código abierto y gratuito para uso personal y educativo.
