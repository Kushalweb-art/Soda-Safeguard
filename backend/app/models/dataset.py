
from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class CsvDataset(Base):
    __tablename__ = "csv_datasets"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=func.now())
    columns = Column(JSON, nullable=False)
    row_count = Column(Integer, nullable=False)
    preview_data = Column(JSON, nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "fileName": self.file_name,
            "uploadedAt": self.uploaded_at.isoformat(),
            "columns": self.columns,
            "rowCount": self.row_count,
            "previewData": self.preview_data
        }
