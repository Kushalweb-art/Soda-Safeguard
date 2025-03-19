
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import ValidationBuilder from '@/components/validation/ValidationBuilder';
import { CsvDataset, PostgresConnection, ValidationResult } from '@/types';
import { fetchCsvDatasets, fetchPostgresConnections } from '@/utils/api';
import PageTransition from '@/components/ui/PageTransition';

const DataValidation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [postgresConnections, setPostgresConnections] = useState<PostgresConnection[]>([]);
  const [csvDatasets, setCsvDatasets] = useState<CsvDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const datasetId = queryParams.get('datasetId');
  const datasetType = queryParams.get('type') as 'postgres' | 'csv' | null;
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    
    try {
      console.log("Loading datasets and connections...");
      // Load both PostgreSQL connections and CSV datasets in parallel
      const [connectionsResponse, datasetsResponse] = await Promise.all([
        fetchPostgresConnections(),
        fetchCsvDatasets(),
      ]);
      
      if (connectionsResponse.success && connectionsResponse.data) {
        console.log("PostgreSQL connections loaded:", connectionsResponse.data);
        
        // Check if each connection has tables
        connectionsResponse.data.forEach(conn => {
          console.log(`Connection ${conn.name} has ${conn.tables?.length || 0} tables`);
          if (conn.tables) {
            conn.tables.forEach(table => {
              console.log(`Table ${table.name} has ${table.columns.length} columns`);
            });
          }
        });
        
        setPostgresConnections(connectionsResponse.data);
      } else {
        console.error("Failed to load PostgreSQL connections:", connectionsResponse.error);
      }
      
      if (datasetsResponse.success && datasetsResponse.data) {
        setCsvDatasets(datasetsResponse.data);
        console.log("Loaded CSV datasets:", datasetsResponse.data);
      } else {
        console.error("Failed to load CSV datasets:", datasetsResponse.error);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load datasets and connections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleValidationComplete = (result: ValidationResult) => {
    console.log("Validation completed:", result);
    setValidationResult(result);
    
    // After validation is complete, navigate to results page
    setTimeout(() => {
      navigate('/results');
    }, 2500);
  };
  
  const hasDatasets = postgresConnections.length > 0 || csvDatasets.length > 0;
  
  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Data Validation</h1>
            <p className="text-muted-foreground">
              Create and run data quality validation checks
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/datasets')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Datasets
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {validationResult && (
          <Alert
            className={
              validationResult.status === 'passed'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }
          >
            <AlertTitle className="flex items-center gap-2">
              {validationResult.status === 'passed' ? 'Validation Passed' : 'Validation Failed'}
            </AlertTitle>
            <AlertDescription>
              {validationResult.status === 'passed' 
                ? 'Your data passed all validation checks'
                : `Found ${validationResult.metrics.failedCount} failures. Redirecting to the results page...`
              }
            </AlertDescription>
          </Alert>
        )}
        
        {!hasDatasets && !loading && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No datasets available</AlertTitle>
            <AlertDescription>
              Please add a PostgreSQL connection or upload a CSV file before creating validation checks.
              <div className="mt-2">
                <Button size="sm" variant="outline" asChild>
                  <a href="/datasets">Add Dataset</a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {hasDatasets && (
          <ValidationBuilder
            postgresConnections={postgresConnections}
            csvDatasets={csvDatasets}
            onValidationComplete={handleValidationComplete}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default DataValidation;
