import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_active_tenant
from app.models.store_config import StoreConfig
from app.models.tenant import Tenant
from app.services.estrategas import get_gemini_key

router = APIRouter(prefix="/api/admin/ai", tags=["admin-ai"])

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

SYSTEM_PROMPT = """Eres un experto en copywriting de ventas para e-commerce latinoamericano (contraentrega/COD).
Tu trabajo es escribir textos CORTOS, PERSUASIVOS y EMOCIONALES que:
- Tocan dolores reales del cliente (miedo, frustración, urgencia)
- Resaltan beneficios concretos, no características
- Mencionan ahorro de dinero o tiempo cuando sea relevante
- Crean urgencia sin ser agresivos
- Usan lenguaje coloquial latinoamericano (tuteo)
- Son directos y van al grano

IMPORTANTE:
- Los textos deben ser MUY CORTOS (1-2 oraciones máximo)
- No uses comillas, asteriscos ni markdown
- No pongas emojis a menos que se pida
- Responde SOLO con el texto generado, nada más"""


class GenerateTextRequest(BaseModel):
    field: str  # "title", "subtitle", "description"
    product_name: str
    upsell_product_name: str
    upsell_product_description: str | None = None
    current_text: str | None = None


class GenerateTextResponse(BaseModel):
    text: str


async def _resolve_gemini_key(tenant: Tenant, db: AsyncSession) -> str:
    """Try estrategas.com first, then fall back to local store config."""
    # 1. Try Estrategas IA (shared Supabase)
    key = await get_gemini_key(tenant.email)
    if key:
        return key

    # 2. Fallback: local store_configs.gemini_api_key
    result = await db.execute(
        select(StoreConfig).where(StoreConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    if config and config.gemini_api_key:
        return config.gemini_api_key

    raise HTTPException(
        status_code=400,
        detail="No se encontro API key de Gemini. Configurala en estrategasia.com > Configuracion.",
    )


@router.get("/status")
async def ai_status(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    """Check if Gemini API key is available (from estrategas or local)."""
    # 1. Try Estrategas
    key = await get_gemini_key(tenant.email)
    if key:
        return {"available": True, "source": "estrategas"}

    # 2. Fallback: local
    result = await db.execute(
        select(StoreConfig).where(StoreConfig.tenant_id == tenant.id)
    )
    config = result.scalar_one_or_none()
    if config and config.gemini_api_key:
        return {"available": True, "source": "local"}

    return {"available": False, "source": None}


@router.post("/generate-upsell-text", response_model=GenerateTextResponse)
async def generate_upsell_text(
    data: GenerateTextRequest,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(require_active_tenant),
):
    api_key = await _resolve_gemini_key(tenant, db)

    field_instructions = {
        "title": f"Escribe un titulo de upsell popup (max 10 palabras). El cliente esta comprando '{data.product_name}' y le ofreces '{data.upsell_product_name}'. El titulo debe hacer que el cliente sienta que NECESITA este producto adicional. Puedes usar {{product_name}} para insertar el nombre del producto upsell y {{first_name}} para el nombre del cliente.",
        "subtitle": f"Escribe un subtitulo corto (max 15 palabras) para un popup de upsell. El cliente compra '{data.product_name}' y le ofreces '{data.upsell_product_name}'. El subtitulo debe reforzar la urgencia o el beneficio.",
        "description": f"Escribe una descripcion muy corta (2-3 oraciones) del producto '{data.upsell_product_name}' como upsell. {'Descripcion actual: ' + data.upsell_product_description if data.upsell_product_description else ''} Enfócate en los dolores del cliente que este producto resuelve y en cómo complementa a '{data.product_name}'. Menciona ahorro o beneficio concreto.",
        "tick_checkbox": f"Escribe un texto corto (max 10 palabras) para el checkbox de un upsell en el checkout. El upsell se llama '{data.upsell_product_name}'. Debe ser una frase persuasiva que haga al cliente querer marcar la casilla. Puedes usar {{{{title}}}} para insertar el titulo y {{{{price}}}} para el precio.",
        "tick_description": f"Escribe una descripcion MUY corta (1 oracion, max 12 palabras) de por que el cliente deberia agregar '{data.upsell_product_name}' a su pedido. Debe generar urgencia o resaltar el beneficio.",
    }

    user_prompt = field_instructions.get(data.field)
    if not user_prompt:
        raise HTTPException(status_code=400, detail=f"Campo '{data.field}' no soportado")

    if data.current_text:
        user_prompt += f"\n\nTexto actual (mejóralo o genera una alternativa): {data.current_text}"

    # Call Gemini API
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.9,
            "maxOutputTokens": 150,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={api_key}",
                json=payload,
            )
            if resp.status_code != 200:
                error_detail = resp.json().get("error", {}).get("message", resp.text[:200])
                raise HTTPException(status_code=502, detail=f"Error de Gemini: {error_detail}")

            result_data = resp.json()
            text = result_data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return GenerateTextResponse(text=text)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Gemini no respondio a tiempo")
    except (KeyError, IndexError):
        raise HTTPException(status_code=502, detail="Respuesta inesperada de Gemini")
