# Filosofía de Pruebas de Finzi

"El 100% de cobertura de pruebas es la clave para un desarrollo ágil y seguro. Las pruebas te permiten moverte rápido, confiar en tus instintos y entregar con confianza; sin ellas, programar es solo improvisar. Con pruebas, es un superpoder."

## Framework
Utilizamos **Jest** con **@testing-library/react-native** y **jest-expo**.

## Cómo ejecutar las pruebas
```bash
npm test
```

## Estructura de Pruebas
- **Unitarias:** Pruebas de lógica pura en hooks y utilidades (ej. `GameContext.test.tsx`).
- **Regresión:** Pruebas que aseguran que errores críticos corregidos no vuelvan a aparecer (ej. `Regression.test.tsx`).
- **Integración:** Pruebas de navegación y flujo de usuario.

## Convenciones
- Los archivos de prueba deben vivir en la carpeta `__tests__/`.
- Usar mocks para todas las dependencias nativas (Haptics, Audio) y llamadas a API.
- Seguir el patrón de nombrado `{NombreComponente}.test.tsx`.

## Reglas de Oro
1. Nunca subas código que rompa las pruebas existentes.
2. Al corregir un bug, escribe siempre una prueba de regresión.
3. Al añadir una funcionalidad, añade su prueba correspondiente.
