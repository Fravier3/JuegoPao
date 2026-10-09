# Paola · Moto Run
Juego de saltos en una moto roja y blanca para iPhone y PC.

- Toca o pulsa espacio/↑ para saltar; un segundo toque permite doble salto.
- La velocidad aumenta al superar obstáculos, con un límite y espacios jugables.
- Ambas ruedas giran según la velocidad, también en el aire. Horquilla, escape, frenos y basculante permanecen fijos.
- Paola tiene imágenes distintas para conducir, saltar y caer de la moto.
- Pausa con el botón, P o Escape. Salir de la pestaña pausa automáticamente.
- Sonido opcional, récord local, galería para ver las poses y reinicio.
- Motor con paso fijo de 120 Hz, independiente de la frecuencia de pantalla.

## Ejecutar y probar
`python -m http.server 8000`, luego abrir http://localhost:8000.
`npm test` ejecuta las pruebas de física.

## Arte
Imágenes de Paola creadas con ImageGen integrado usando el sprite original como referencia: conserva físico, rostro, cabello castaño, chaqueta y pantalón denim, blusa amarilla y tenis verdes. La moto es roja y blanca. Sprites detallados de 1536 × 1024 píxeles con transparencia, convertidos a WebP.

Prompts: conducir montada en moto roja y blanca, vista lateral derecha; saltar manteniendo mujer y moto con la rueda delantera elevada y una pose distinta; caer fuera del asiento junto a la moto de lado, sin heridas gráficas. Conservación estricta de identidad, físico y ropa entre poses.

Los seis obstáculos son cono, barrera, goma, caja, piedras y zafacón, generados como atlas ilustrado de carretera. Las imágenes anteriores de patineta se conservan en el historial y como recursos anteriores.
