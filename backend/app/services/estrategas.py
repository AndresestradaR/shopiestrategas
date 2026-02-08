"""
Bridge to Estrategas IA platform (Supabase).

Fetches shared API keys (Gemini, OpenAI, etc.) from the central
profiles table so MiniShop users don't need to enter them again.

Flow:
  tenant.email  →  Supabase auth.users (find user id)
                →  Supabase profiles.google_api_key (encrypted)
                →  AES-256-GCM decrypt  →  plain API key
"""

import time

import httpx
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import settings

# In-memory cache: {email: (decrypted_key, expires_at)}
_key_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 300  # 5 minutes


def _is_configured() -> bool:
    return bool(
        settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_ROLE_KEY
        and settings.ENCRYPTION_KEY
    )


def _decrypt(encrypted_text: str) -> str:
    """Decrypt AES-256-GCM value stored by estrategas (Node.js crypto).

    Format: iv_hex:authTag_hex:ciphertext_hex
    """
    key = bytes.fromhex(settings.ENCRYPTION_KEY)
    iv_hex, auth_tag_hex, ciphertext_hex = encrypted_text.split(":")
    iv = bytes.fromhex(iv_hex)
    auth_tag = bytes.fromhex(auth_tag_hex)
    ciphertext = bytes.fromhex(ciphertext_hex)

    # AESGCM.decrypt expects nonce + (ciphertext || tag)
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
    return plaintext.decode("utf-8")


async def get_gemini_key(email: str) -> str | None:
    """Return the decrypted Gemini API key for *email* from Supabase.

    Returns None when:
    - Supabase credentials not configured
    - User not found in Supabase
    - User has no Gemini key configured
    - Decryption fails
    """
    if not _is_configured():
        return None

    # Check cache
    now = time.time()
    cached = _key_cache.get(email)
    if cached and cached[1] > now:
        return cached[0]

    try:
        headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            # Step 1: Find Supabase user by email via Admin Auth API
            resp = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users",
                headers=headers,
                params={"page": 1, "per_page": 1000},
            )
            if resp.status_code != 200:
                print(f"[estrategas] admin users API error: {resp.status_code}")
                return None

            users = resp.json().get("users", [])
            user = next((u for u in users if u.get("email") == email), None)
            if not user:
                return None

            # Step 2: Get profile.google_api_key via PostgREST
            resp = await client.get(
                f"{settings.SUPABASE_URL}/rest/v1/profiles",
                headers={**headers, "Content-Type": "application/json"},
                params={"id": f"eq.{user['id']}", "select": "google_api_key"},
            )
            if resp.status_code != 200:
                print(f"[estrategas] profiles API error: {resp.status_code}")
                return None

            profiles = resp.json()
            if not profiles or not profiles[0].get("google_api_key"):
                return None

            # Step 3: Decrypt
            decrypted = _decrypt(profiles[0]["google_api_key"])

            # Cache it
            _key_cache[email] = (decrypted, now + _CACHE_TTL)
            return decrypted

    except Exception as e:
        print(f"[estrategas] error fetching gemini key for {email}: {e}")
        return None
