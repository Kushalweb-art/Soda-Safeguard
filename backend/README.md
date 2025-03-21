
# Data Validator Backend

This is the FastAPI backend for the Data Validator application. It provides a full REST API for managing PostgreSQL connections, CSV datasets, and data validation.

## Setup and Installation

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables by editing the `.env` file.

4. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at http://localhost:8000.

## API Documentation

When the server is running, FastAPI automatically generates API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### PostgreSQL Connections
- `GET /api/postgres/connections` - Get all connections
- `POST /api/postgres/connections` - Create a new connection
- `GET /api/postgres/connections/{connection_id}` - Get connection by ID
- `POST /api/postgres/connections/test` - Test a connection
- `GET /api/postgres/schema` - Get database schema

### CSV Datasets
- `GET /api/datasets/csv` - Get all CSV datasets
- `POST /api/datasets/csv/upload` - Upload a CSV file
- `GET /api/datasets/csv/{dataset_id}` - Get CSV dataset by ID

### Validation
- `GET /api/validation/checks` - Get all validation checks
- `POST /api/validation/checks` - Create a new validation check
- `GET /api/validation/checks/{check_id}` - Get validation check by ID
- `GET /api/validation/results` - Get all validation results
- `POST /api/validation/run/{check_id}` - Run a validation check
- `GET /api/validation/results/{result_id}` - Get validation result by ID
