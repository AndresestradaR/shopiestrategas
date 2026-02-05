#!/bin/bash
# ============================================
# ralph.sh — Loop autónomo para MiniShop
# Ejecuta Claude Code iterativamente hasta
# completar todas las tareas del PRD.
# ============================================

set -e

MAX_ITERATIONS=60
ITERATION=0
SLEEP_BETWEEN=5

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🏪 MiniShop Ralph Loop — Starting${NC}"
echo -e "${BLUE}Max iterations: ${MAX_ITERATIONS}${NC}"
echo ""

PROMPT=$(cat << 'PROMPT_END'
Read CLAUDE.md for project context.
Read PRD.md for the full task list.
Read PROGRESS.md to see what's already done.

Find the NEXT unchecked task ([ ]) in PROGRESS.md.
Implement it completely:
1. Write the code
2. Run any relevant tests (pytest for backend, npm test for frontend)
3. Fix any errors
4. Git add and commit with conventional commit format
5. Mark the task as [x] in PROGRESS.md
6. Add a log entry at the bottom of PROGRESS.md with timestamp

If ALL tasks are marked [x], output exactly: ALL_DONE

Important:
- Only implement ONE task per iteration
- Make sure the code actually works before committing
- Follow the conventions in CLAUDE.md
- If a task depends on something not yet built, implement a minimal stub
PROMPT_END
)

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🔄 Iteración ${ITERATION}/${MAX_ITERATIONS}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Ejecutar Claude Code
    OUTPUT=$(claude -p "$PROMPT" --output-format text 2>&1) || true
    
    # Mostrar resumen
    echo "$OUTPUT" | tail -5
    echo ""
    
    # Verificar si terminó
    if echo "$OUTPUT" | grep -q "ALL_DONE"; then
        echo -e "${GREEN}✅ ¡Ralph completó TODAS las tareas!${NC}"
        echo -e "${GREEN}🏪 MiniShop está listo.${NC}"
        
        # Mostrar resumen final
        echo ""
        echo -e "${BLUE}📊 Resumen:${NC}"
        echo "   Iteraciones: ${ITERATION}"
        echo "   Commits: $(git log --oneline | wc -l)"
        echo "   Archivos: $(find . -name '*.py' -o -name '*.jsx' -o -name '*.js' | wc -l)"
        
        exit 0
    fi
    
    # Verificar si hubo error grave
    if echo "$OUTPUT" | grep -qi "error\|failed\|exception"; then
        echo -e "${RED}⚠️  Posible error detectado, pero Ralph sigue intentando...${NC}"
    fi
    
    # Mostrar progreso
    DONE=$(grep -c "\[x\]" PROGRESS.md 2>/dev/null || echo 0)
    TOTAL=$(grep -c "\[ \]" PROGRESS.md 2>/dev/null || echo 0)
    TOTAL=$((DONE + TOTAL))
    echo -e "${BLUE}📈 Progreso: ${DONE}/${TOTAL} tareas completadas${NC}"
    
    # Pausa entre iteraciones
    echo -e "   Siguiente iteración en ${SLEEP_BETWEEN}s..."
    sleep $SLEEP_BETWEEN
done

echo -e "${RED}⚠️  Ralph alcanzó el límite de ${MAX_ITERATIONS} iteraciones${NC}"
echo -e "${YELLOW}Revisa PROGRESS.md para ver qué falta.${NC}"
exit 1
