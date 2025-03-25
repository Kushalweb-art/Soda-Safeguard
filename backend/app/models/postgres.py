
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
import json
from app.database import Base

class PostgresConnection(Base):
    __tablename__ = "postgres_connections"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    database = Column(String, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    tables = Column(Text, nullable=False, default='[]')
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "host": self.host,
            "port": self.port,
            "database": self.database,
            "username": self.username,
            "password": self.password,
            "createdAt": self.created_at.isoformat(),
            "tables": json.loads(self.tables)
        }
