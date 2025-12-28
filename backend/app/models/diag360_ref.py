from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, TEXT

from app.db import Base


class Need(Base):
    __tablename__ = "needs"
    __table_args__ = {"schema": "diag360_ref"}

    id = Column(String, primary_key=True)
    label = Column(Text, nullable=False)
    url = Column(Text)
    occurrence_count = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Objective(Base):
    __tablename__ = "objectives"
    __table_args__ = {"schema": "diag360_ref"}

    id = Column(String, primary_key=True)
    label = Column(Text, nullable=False)
    url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class IndicatorType(Base):
    __tablename__ = "indicator_types"
    __table_args__ = {"schema": "diag360_ref"}

    id = Column(String, primary_key=True)
    label = Column(Text, nullable=False)
    url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Indicator(Base):
    __tablename__ = "indicators"
    __table_args__ = {"schema": "diag360_ref"}

    id = Column(String, primary_key=True)
    label = Column(Text, nullable=False)
    primary_domain = Column(Text)
    primary_url = Column(Text)
    primary_api_available = Column(Boolean, default=False)
    secondary_domain = Column(Text)
    secondary_url = Column(Text)
    value_type = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class IndicatorNeedLink(Base):
    __tablename__ = "indicator_need_links"
    __table_args__ = {"schema": "diag360_ref"}

    indicator_id = Column(String, ForeignKey("diag360_ref.indicators.id", ondelete="CASCADE"), primary_key=True)
    need_id = Column(String, ForeignKey("diag360_ref.needs.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String, primary_key=True)
    need_category = Column(Text)
    need_label = Column(Text)
    extra_needs = Column(ARRAY(TEXT))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class IndicatorObjectiveLink(Base):
    __tablename__ = "indicator_objective_links"
    __table_args__ = {"schema": "diag360_ref"}

    indicator_id = Column(String, ForeignKey("diag360_ref.indicators.id", ondelete="CASCADE"), primary_key=True)
    objective_id = Column(String, ForeignKey("diag360_ref.objectives.id", ondelete="CASCADE"), primary_key=True)
    covers_subsistence = Column(Boolean, default=False)
    covers_crisis = Column(Boolean, default=False)
    covers_sustainability = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class IndicatorTypeLink(Base):
    __tablename__ = "indicator_type_links"
    __table_args__ = {"schema": "diag360_ref"}

    indicator_id = Column(String, ForeignKey("diag360_ref.indicators.id", ondelete="CASCADE"), primary_key=True)
    indicator_type_id = Column(String, ForeignKey("diag360_ref.indicator_types.id", ondelete="CASCADE"), primary_key=True)
    is_state = Column(Boolean, default=False)
    is_action = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
