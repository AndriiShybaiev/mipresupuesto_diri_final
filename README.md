# MiPresupuesto — guía rápida

## Ejecución local

- `npm install`
- `npm run dev`

## Demo seed (etapa 7)

Este proyecto incluye carga de datos demo desde el panel admin para visualizar mejor los gráficos del dashboard.

Credenciales objetivo:

- Admin: `admin@email.com` / `123456`
- Usuario estándar: `user@user.user` / `123456`

Pasos:

1. Inicia sesión con `admin@email.com`.
2. Ve a `Admin Panel`.
3. Pulsa `Cargar seed demo`.
4. Abre `Dashboard` con admin o usuario para ver gráficos con datos de 5 meses.

Limpieza de datos demo:

- Desde `Admin Panel`, pulsa `Limpiar seed demo`.

Notas:

- El seed escribe transacciones en `users/{uid}/transactions` para ambos usuarios.
- Si aparece error de permisos, revisa reglas de Firebase para lectura/escritura de `users/{uid}` y su rama `transactions`.
