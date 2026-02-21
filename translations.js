/**
 * Translation dictionary for the Linux Memory Training app.
 * Supports Spanish (es), Esperanto (eo), and English (en).
 */
const translations = {
    es: {
        boxes: "Cajas:",
        time: "Tiempo (s):",
        quick: "5s (Rápido)",
        noLimit: "Sin Límite",
        startGame: "Empezar",
        checkResults: "Comprobar",
        reset: "Reiniciar",
        theme: "Tema:",
        timeLabel: "Tiempo:",
        memorize: "Memoriza",
        memorizar: "Memorizar",
        selectImage: "Selecciona la imagen correspondiente",
        cancel: "Cancelar",
        score: "Puntuación: {correct} / {total} correctas!",
        stats: "Memorizado en: {mTime}s | Recordado en: {rTime}s",
        selectThemeAlert: "Por favor, selecciona un tema.",
        emptyThemeAlert: "Esta carpeta de tema está vacía."
    },
    eo: {
        boxes: "Kestoj:",
        time: "Tempo (s):",
        quick: "5s (Rapida)",
        noLimit: "Sen Limo",
        startGame: "Komenci",
        checkResults: "Kontroli",
        reset: "Rekomenci",
        theme: "Temo:",
        timeLabel: "Tempo:",
        memorize: "Memoru",
        memorizar: "Memori",
        selectImage: "Elektu la korespondan bildon",
        cancel: "Nuligi",
        score: "Poentaro: {correct} / {total} ĝustaj!",
        stats: "Memorita en: {mTime}s | Memorrevokita en: {rTime}s",
        selectThemeAlert: "Bonvolu elekti temon.",
        emptyThemeAlert: "Ĉi tiu temo-dosierujo estas malplena."
    },
    en: {
        boxes: "Boxes:",
        time: "Time (s):",
        quick: "5s (Quick)",
        noLimit: "No Limit",
        startGame: "Start Game",
        checkResults: "Check Results",
        reset: "Reset",
        theme: "Theme:",
        timeLabel: "Time:",
        memorize: "Memorize",
        memorizar: "Memorize",
        selectImage: "Select the corresponding image",
        cancel: "Cancel",
        score: "Score: {correct} / {total} correct!",
        stats: "Memorized in: {mTime}s | Recalled in: {rTime}s",
        selectThemeAlert: "Please select a theme.",
        emptyThemeAlert: "This theme folder is empty."
    }
};

if (typeof module !== 'undefined') {
    module.exports = translations;
}
