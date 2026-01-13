"""Text history model for storing user's processed texts."""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class OperationType(enum.Enum):
    """Types of operations performed on text."""
    GRAMMAR_CHECK = "grammar_check"
    SUMMARIZE = "summarize"
    SYNONYM_LOOKUP = "synonym_lookup"


class TextHistory(Base):
    """Text history model for tracking processed texts."""

    __tablename__ = "text_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    operation_type = Column(Enum(OperationType), nullable=False, index=True)
    input_text = Column(Text, nullable=False)
    output_result = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to user
    user = relationship("User", back_populates="text_histories")

    def __repr__(self):
        return f"<TextHistory(id={self.id}, operation={self.operation_type}, user_id={self.user_id})>"
