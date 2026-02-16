# Seguridad

## No subir secretos al repositorio

- **Nunca** hagas commit de `.env` ni de archivos que contengan contraseñas, API keys o tokens reales.
- Usa **solo** `.env.example` como plantilla (ya tiene placeholders). Copia a `.env` local y rellena con tus credenciales; `.env` está en `.gitignore`.
- Si alguna vez subiste credenciales por error:
  1. Rota **inmediatamente** todas las claves (Clerk, Supabase, base de datos).
  2. Considera usar el [historial de secretos de GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) si el commit ya fue pusheado.

## Variables de entorno sensibles

- `DATABASE_URL` — conexión a PostgreSQL (incluye usuario y contraseña).
- `CLERK_SECRET_KEY` — clave secreta de Clerk; solo backend.
- `SUPABASE_SECRET_KEY` — clave secreta de Supabase; solo backend.

Estas no deben aparecer en código, en `.env` commiteado ni en logs.

## Reportar vulnerabilidades

Si encuentras una vulnerabilidad en este proyecto, no la abras como issue público. Contacta de forma privada al mantenedor del repositorio.
