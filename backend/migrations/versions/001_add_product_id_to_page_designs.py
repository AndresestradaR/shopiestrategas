"""add product_id to page_designs

Revision ID: 001_product_landing
Revises:
Create Date: 2026-02-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "001_product_landing"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add product_id column
    op.add_column(
        "page_designs",
        sa.Column("product_id", UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="SET NULL"), nullable=True),
    )

    # Drop old unique constraint and create new one
    op.drop_constraint("uq_pagedesign_tenant_type_slug", "page_designs", type_="unique")
    op.create_unique_constraint("uq_pagedesign_tenant_slug", "page_designs", ["tenant_id", "slug"])


def downgrade():
    op.drop_constraint("uq_pagedesign_tenant_slug", "page_designs", type_="unique")
    op.create_unique_constraint("uq_pagedesign_tenant_type_slug", "page_designs", ["tenant_id", "page_type", "slug"])
    op.drop_column("page_designs", "product_id")
