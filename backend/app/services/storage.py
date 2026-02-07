"""Storage abstraction — Cloudflare R2 in production, local filesystem in dev."""

import os

import boto3
from botocore.config import Config as BotoConfig

from app.config import settings

_s3_client = None


def _get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=BotoConfig(signature_version="s3v4"),
            region_name="auto",
        )
    return _s3_client


def is_r2_configured() -> bool:
    return all([
        settings.R2_ACCOUNT_ID,
        settings.R2_ACCESS_KEY_ID,
        settings.R2_SECRET_ACCESS_KEY,
        settings.R2_BUCKET_NAME,
        settings.R2_PUBLIC_URL,
    ])


def upload_file(content: bytes, key: str, content_type: str = "image/jpeg") -> str:
    """Upload file and return its public URL.

    If R2 is configured, uploads to Cloudflare R2 and returns the public URL.
    Otherwise, saves to local filesystem and returns a relative /uploads/ path.
    """
    if is_r2_configured():
        client = _get_s3_client()
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
        public_url = settings.R2_PUBLIC_URL.rstrip("/")
        return f"{public_url}/{key}"

    # Fallback: local filesystem
    filepath = os.path.join(settings.UPLOAD_DIR, key)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(content)
    return f"/uploads/{key}"


def url_to_key(url: str) -> str | None:
    """Extract the storage key from a URL (R2 or local).

    R2 URL:   https://pub-xxx.r2.dev/tenant/products/file.jpg → tenant/products/file.jpg
    Local URL: /uploads/tenant/products/file.jpg               → tenant/products/file.jpg
    """
    if not url:
        return None
    if url.startswith("http") and settings.R2_PUBLIC_URL:
        prefix = settings.R2_PUBLIC_URL.rstrip("/") + "/"
        if url.startswith(prefix):
            return url[len(prefix):]
    if url.startswith("/uploads/"):
        return url[len("/uploads/"):]
    return None


def delete_file(key: str) -> None:
    """Delete a file from storage."""
    if is_r2_configured():
        client = _get_s3_client()
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
    else:
        filepath = os.path.join(settings.UPLOAD_DIR, key)
        if os.path.exists(filepath):
            os.remove(filepath)


def delete_by_url(url: str) -> None:
    """Delete a file from storage using its URL."""
    key = url_to_key(url)
    if key:
        delete_file(key)
