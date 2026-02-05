# 🚀 Guía: MiniShop con Claude Code + Ralph

> Todo lo que necesitas para que Claude Code construya MiniShop de forma autónoma en tu máquina local.

---

## Paso 1: Instalar Claude Code

Claude Code es el CLI de Anthropic para coding con IA. Vive en tu terminal.

```bash
# Requisito: Node.js 18+
node --version  # debe ser >= 18

# Instalar Claude Code globalmente
npm install -g @anthropic-ai/claude-code

# Verificar instalación
claude --version

# Primera vez: autenticarte con tu cuenta de Anthropic
claude
# Te va a pedir login con tu API key o cuenta
```

> 📖 Docs oficiales: https://docs.claude.com/en/docs/claude-code/overview

---

## Paso 2: Crear el proyecto local

```bash
# Crear carpeta del proyecto
mkdir minishop && cd minishop

# Inicializar git (OBLIGATORIO para Ralph)
git init
git add .
git commit -m "initial commit"

# Crear estructura base
mkdir -p backend/app frontend-admin frontend-store docs
```

---

## Paso 3: Instalar el plugin Ralph Wiggum

Ralph es un plugin oficial de Claude Code:

```bash
# Dentro de tu proyecto, abrir Claude Code
claude

# Instalar el plugin desde el marketplace
/plugin marketplace add anthropics/claude-code
/plugin install ralph-wiggum@claude-plugins-official
```

**Alternativa sin plugin (bash loop puro):**

Si prefieres no usar el plugin, Ralph en su forma más pura es esto:

```bash
# ralph.sh — El loop más simple
#!/bin/bash
while true; do
  claude -p "$(cat PROMPT.md)" --output-format stream-json
  
  # Verificar si terminó
  if grep -q "EXIT_SIGNAL" <<< "$(claude -p 'Check if all PRD items are done')"; then
    echo "✅ Ralph terminó todas las tareas!"
    break
  fi
  
  echo "🔄 Siguiente iteración..."
  sleep 5
done
```

---

## Paso 4: Los archivos que necesitas

Ralph necesita mínimo 3 archivos en tu proyecto:

```
minishop/
├── CLAUDE.md          ← Instrucciones para Claude Code (contexto del proyecto)
├── PRD.md             ← Product Requirements Document (la lista de tareas)
├── PROGRESS.md        ← Tracking de progreso (Ralph lo actualiza solo)
├── ralph.sh           ← El script del loop (si no usas el plugin)
└── ... (tu código)
```

Yo te voy a generar los 3 archivos principales. Tú solo los pones en la raíz del proyecto.

---

## Paso 5: Ejecutar Ralph

### Opción A: Con el plugin (recomendado)

```bash
# Abrir Claude Code en tu proyecto
cd minishop
claude

# Ejecutar Ralph con tu PRD
/ralph-loop "Build the MiniShop platform following PRD.md. Check PROGRESS.md for current status. Implement the next unchecked item, run tests, commit, and update PROGRESS.md. Output <promise>ALL_DONE</promise> when every item in PRD.md is checked." --max-iterations 50 --completion-promise "ALL_DONE"
```

### Opción B: Con bash loop

```bash
cd minishop
chmod +x ralph.sh
./ralph.sh
```

### Opción C: Manual (human-in-the-loop)

Si prefieres supervisar cada iteración:

```bash
cd minishop
claude

# Tú le dices manualmente cada vez:
> Lee PRD.md y PROGRESS.md. Implementa la siguiente tarea pendiente. 
> Cuando termines, haz commit y actualiza PROGRESS.md.
```

---

## Paso 6: Monitorear

```bash
# En otra terminal, ver el progreso
watch -n 5 cat PROGRESS.md

# Ver los commits que va haciendo
git log --oneline

# Ver los archivos que va creando
find . -name "*.py" -o -name "*.jsx" | head -20
```

---

## Consejos para Ralph

### 1. Tareas pequeñas y claras
Cada item del PRD debe completarse en una iteración. Si es muy grande, Ralph se pierde.

**Mal:** "Implementar todo el sistema de productos"
**Bien:** "Crear modelo SQLAlchemy para Product con campos: name, slug, price, compare_at_price, cost_price, is_active"

### 2. Tests como validación
Ralph verifica su trabajo corriendo tests. Sin tests, no sabe si lo que hizo está bien.

### 3. Commits frecuentes
Cada iteración debe hacer commit. Si algo sale mal, haces `git revert`.

### 4. Empezar supervisado
Las primeras 3-5 iteraciones hazlas en modo manual para ver cómo trabaja. Después lo dejas solo.

### 5. Max iterations como safety net
Siempre pon `--max-iterations`. 50 es un buen número para empezar. Si se queda pegado, para solo.

---

## Flujo recomendado para MiniShop

```
Fase 1: Backend Core
├── Ejecutar Ralph con PRD Fase 1 (backend)
├── ~15-20 iteraciones
├── Resultado: API funcionando con tests
└── Tú revisas, ajustas, haces merge

Fase 2: Frontend Admin (Builder)
├── Ejecutar Ralph con PRD Fase 2 (frontend admin)
├── ~15-20 iteraciones  
├── Resultado: Dashboard React funcionando
└── Tú revisas, ajustas, haces merge

Fase 3: Frontend Tienda (Público)
├── Ejecutar Ralph con PRD Fase 3 (tienda pública)
├── ~15-20 iteraciones
├── Resultado: Tienda renderizando
└── Tú revisas, ajustas, haces merge

Fase 4: Integraciones
├── Pixels, Dropi export, dominio
├── ~10-15 iteraciones
└── Tú revisas y deploy
```

Puedes correr fases en paralelo usando git worktrees:

```bash
# Branch para backend
git worktree add ../minishop-backend -b feature/backend
cd ../minishop-backend
/ralph-loop "Phase 1: Backend..." --max-iterations 25

# Branch para frontend (en otra terminal)
git worktree add ../minishop-frontend -b feature/frontend
cd ../minishop-frontend
/ralph-loop "Phase 2: Frontend..." --max-iterations 25
```

---

## Después de Ralph: Deploy local

Una vez que Ralph termine y tú revises el código:

```bash
# Backend
cd backend
pip install -r requirements.txt
# Crear .env con DATABASE_URL, SECRET_KEY, etc.
alembic upgrade head  # correr migraciones
uvicorn app.main:app --reload --port 8000

# Frontend Admin
cd frontend-admin
npm install
npm run dev  # http://localhost:5173

# Frontend Tienda
cd frontend-store
npm install
npm run dev  # http://localhost:3000

# PostgreSQL (con Docker)
docker run -d --name minishop-db \
  -e POSTGRES_DB=minishop \
  -e POSTGRES_USER=minishop \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  postgres:16
```

---

## Deploy a producción (después de local)

Cuando todo funcione en local:

1. **Backend:** VPS en DigitalOcean/Hetzner con Docker
2. **Frontend Tienda:** Vercel o Cloudflare Pages
3. **Frontend Admin:** Vercel o mismo VPS
4. **Base de datos:** PostgreSQL managed (DigitalOcean, Supabase, o Neon)
5. **Dominio:** Cloudflare DNS
6. **Storage imágenes:** Cloudflare R2

Pero eso lo vemos después. Primero local, después deploy.
