# Paola · Skate Run
Juego de patineta para iPhone y PC. Conserva los cinco sprites originales de Paola, extraídos sin modificar de la versión anterior.

- Toca o pulsa espacio/↑ para saltar; segundo toque para doble salto.
- La velocidad aumenta únicamente al superar obstáculos y tiene un límite.
- Pausa con el botón, P o Escape. Cambiar de pestaña pausa automáticamente.
- Sonido opcional, récord local y reinicio.
- Motor con paso fijo de 120 Hz, independiente de la frecuencia de pantalla.
- Obstáculos de carretera generados con ImageGen: cono, barrera, goma, caja, piedras y zafacón. El atlas conserva transparencia y se entrega en WebP para reducir la descarga.

## Ejecutar
`python -m http.server 8000`, luego abrir http://localhost:8000.

## Pruebas
`npm test` o `node --test tests/physics.test.js`.

## Arte
Archivo: `assets/road-hazards.webp`. Creado con la herramienta integrada ImageGen.
Prompt: atlas transparente de seis obstáculos cotidianos de carretera en tres columnas y dos filas; cono de tráfico naranja reflectante, barrera de obras naranja/blanca, neumático descartado, caja de madera baja, piedras y zafacón de metal. Vista lateral con ligera perspectiva, ilustración realista pintada, contornos finos oscuros, materiales naturales y luz cálida; objetos aislados, márgenes transparentes, sin personajes, fondo, etiquetas ni texto. Compatible con la ilustración original de Paola en denim y zapatillas verdes sobre su patineta marrón.
