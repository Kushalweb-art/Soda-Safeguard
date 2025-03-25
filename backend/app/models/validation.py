
from sqlalchemy import Column, String, Integer, DateTime, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class ValidationCheck(Base):
    __tablename__ = "validation_checks"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    dataset = Column(JSON, nullable=False)
    table = Column(String, nullable=True)
    column = Column(String, nullable=True)
    parameters = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "dataset": self.dataset,
            "table": self.table,
            "column": self.column,
            "parameters": self.parameters,
            "createdAt": self.created_at.isoformat()
        }

class ValidationResult(Base):
    __tablename__ = "validation_results"
    
    id = Column(String, primary_key=True)
    check_id = Column(String, nullable=False)
    check_name = Column(String, nullable=False)
    dataset = Column(JSON, nullable=False)
    table = Column(String, nullable=True)
    column = Column(String, nullable=True)
    status = Column(String, nullable=False)
    metrics = Column(JSON, nullable=False)
    failed_rows = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "checkId": self.check_id,
            "checkName": self.check_name,
            "dataset": self.dataset,
            "table": self.table,
            "column": self.column,
            "status": self.status,
            "metrics": self.metrics,
            "failedRows": self.failed_rows,
            "errorMessage": self.error_message,
            "createdAt": self.created_at.isoformat()
        }
