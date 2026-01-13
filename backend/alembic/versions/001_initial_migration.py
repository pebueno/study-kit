"""Initial migration with users and text_history tables

Revision ID: 001
Revises:
Create Date: 2026-01-12

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create text_histories table
    op.create_table(
        'text_histories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('operation_type', sa.Enum('GRAMMAR_CHECK', 'SUMMARIZE', 'SYNONYM_LOOKUP', name='operationtype'), nullable=False),
        sa.Column('input_text', sa.Text(), nullable=False),
        sa.Column('output_result', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_text_histories_id'), 'text_histories', ['id'], unique=False)
    op.create_index(op.f('ix_text_histories_operation_type'), 'text_histories', ['operation_type'], unique=False)
    op.create_index(op.f('ix_text_histories_user_id'), 'text_histories', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_text_histories_user_id'), table_name='text_histories')
    op.drop_index(op.f('ix_text_histories_operation_type'), table_name='text_histories')
    op.drop_index(op.f('ix_text_histories_id'), table_name='text_histories')
    op.drop_table('text_histories')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
