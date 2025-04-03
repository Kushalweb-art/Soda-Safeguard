
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
import psycopg2
import uuid
from datetime import datetime
import json

from app.database import get_db
from app.models.postgres import PostgresConnection
from app.schemas.postgres import (
    PostgresConnectionCreate,
    PostgresConnectionResponse,
    SchemaFetchParams,
    ApiResponse,
    PostgresTableSchema
)

router = APIRouter()

@router.get("/connections", response_model=ApiResponse)
async def get_all_connections(db: Session = Depends(get_db)):
    """Get all PostgreSQL connections"""
    connections = db.query(PostgresConnection).order_by(PostgresConnection.created_at.desc()).all()
    return {
        "success": True,
        "data": [conn.to_dict() for conn in connections]
    }

@router.post("/connections", response_model=ApiResponse)
async def create_connection(connection: PostgresConnectionCreate, db: Session = Depends(get_db)):
    """Create a new PostgreSQL connection"""
    # First test the connection
    schema_params = SchemaFetchParams(
        host=connection.host,
        port=connection.port,
        database=connection.database,
        username=connection.username,
        password=connection.password
    )
    
    test_result = await test_connection(schema_params)
    if not test_result["success"]:
        return test_result
    
    # Create new connection with the tables from the test
    new_connection = PostgresConnection(
        id=f"pg_{uuid.uuid4()}",
        name=connection.name,
        host=connection.host,
        port=connection.port,
        database=connection.database,
        username=connection.username,
        password=connection.password,
        created_at=datetime.now(),
        tables=test_result.get("tables", [])
    )
    
    db.add(new_connection)
    db.commit()
    db.refresh(new_connection)
    
    return {
        "success": True,
        "data": new_connection.to_dict()
    }

@router.delete("/connections/{connection_id}", response_model=ApiResponse)
async def delete_connection(connection_id: str, db: Session = Depends(get_db)):
    """Delete a PostgreSQL connection by ID"""
    connection = db.query(PostgresConnection).filter(PostgresConnection.id == connection_id).first()
    if not connection:
        return {
            "success": False,
            "error": "Connection not found"
        }
    
    db.delete(connection)
    db.commit()
    
    return {
        "success": True,
        "data": {"message": f"Connection {connection_id} deleted successfully"}
    }

@router.get("/connections/{connection_id}", response_model=ApiResponse)
async def get_connection_by_id(connection_id: str, db: Session = Depends(get_db)):
    """Get a PostgreSQL connection by ID"""
    connection = db.query(PostgresConnection).filter(PostgresConnection.id == connection_id).first()
    if not connection:
        return {
            "success": False,
            "error": "Connection not found"
        }
    
    return {
        "success": True,
        "data": connection.to_dict()
    }

@router.post("/connections/test", response_model=ApiResponse)
async def test_connection(params: SchemaFetchParams):
    """Test a PostgreSQL connection and return schema information"""
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=params.host,
            port=params.port,
            database=params.database,
            user=params.username,
            password=params.password,
            connect_timeout=5
        )
        
        cursor = conn.cursor()
        
        # Query for tables
        cursor.execute("""
            SELECT 
                t.table_name as name,
                t.table_schema as schema
            FROM 
                information_schema.tables t
            WHERE 
                t.table_schema NOT IN ('pg_catalog', 'information_schema')
                AND t.table_type = 'BASE TABLE'
            ORDER BY 
                t.table_schema, t.table_name
        """)
        
        tables = []
        for table_name, schema_name in cursor.fetchall():
            # Query for columns in this table
            cursor.execute("""
                SELECT 
                    column_name as name,
                    data_type as data_type
                FROM 
                    information_schema.columns
                WHERE 
                    table_schema = %s
                    AND table_name = %s
                ORDER BY 
                    ordinal_position
            """, (schema_name, table_name))
            
            columns = [{"name": name, "dataType": data_type} for name, data_type in cursor.fetchall()]
            
            tables.append({
                "name": table_name,
                "schema": schema_name,
                "columns": columns
            })
        
        conn.close()
        
        return {
            "success": True,
            "data": True,
            "tables": tables,
            "message": f"Connected to database '{params.database}' successfully. Found {len(tables)} tables."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to connect to database: {str(e)}"
        }

@router.get("/schema", response_model=ApiResponse)
async def get_database_schema(
    host: str,
    port: int,
    database: str,
    username: str,
    password: str
):
    """Get schema information from a PostgreSQL database"""
    params = SchemaFetchParams(
        host=host,
        port=port,
        database=database,
        username=username,
        password=password
    )
    
    return await test_connection(params)
