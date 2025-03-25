
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
import json
from app.database import Base
from sqlalchemy.orm import Session

class ValidationCheck(Base):
    __tablename__ = "validation_checks"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    dataset = Column(Text, nullable=False)  # JSON string
    table = Column(String, nullable=True)
    column = Column(String, nullable=True)
    parameters = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "dataset": json.loads(self.dataset),
            "table": self.table,
            "column": self.column,
            "parameters": json.loads(self.parameters),
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

class ValidationResult(Base):
    __tablename__ = "validation_results"
    
    id = Column(String, primary_key=True)
    check_id = Column(String, nullable=False)
    check_name = Column(String, nullable=False)
    dataset = Column(Text, nullable=False)  # JSON string
    table = Column(String, nullable=True)
    column = Column(String, nullable=True)
    status = Column(String, nullable=False)
    metrics = Column(Text, nullable=False)  # JSON string
    failed_rows = Column(Text, nullable=True)  # JSON string
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "checkId": self.check_id,
            "checkName": self.check_name,
            "dataset": json.loads(self.dataset),
            "table": self.table,
            "column": self.column,
            "status": self.status,
            "metrics": json.loads(self.metrics),
            "failedRows": json.loads(self.failed_rows) if self.failed_rows else None,
            "errorMessage": self.error_message,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
