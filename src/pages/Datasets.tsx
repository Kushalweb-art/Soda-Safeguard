
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Database, RefreshCw } from 'lucide-react';
import CsvUploader from '@/components/datasets/CsvUploader';
import PostgresConnectionForm from '@/components/datasets/PostgresConnection';
import DatasetList from '@/components/datasets/DatasetList';
import { CsvDataset, PostgresConnection } from '@/types';
import { fetchCsvDatasets, fetchPostgresConnections } from '@/utils/api';
import PageTransition from '@/components/ui/PageTransition';
import { useToast } from '@/components/ui/use-toast';

const Datasets = () => {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [postgresConnections, setPostgresConnections] = useState<PostgresConnection[]>([]);
  const [csvDatasets, setCsvDatasets] = useState<CsvDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    
    try {
      console.log("Fetching datasets and connections...");
      
      // Fetch PostgreSQL connections
      const connectionsResponse = await fetchPostgresConnections();
      
      if (connectionsResponse.success && connectionsResponse.data) {
        console.log("PostgreSQL connections fetched:", connectionsResponse.data);
        setPostgresConnections(connectionsResponse.data);
      } else {
        console.error("Failed to fetch PostgreSQL connections:", connectionsResponse.error);
        toast({
          title: "Error fetching connections",
          description: connectionsResponse.error || "Could not load PostgreSQL connections",
          variant: "destructive"
        });
      }
      
      // Fetch CSV datasets
      const datasetsResponse = await fetchCsvDatasets();
      
      if (datasetsResponse.success && datasetsResponse.data) {
        console.log("CSV datasets fetched:", datasetsResponse.data);
        setCsvDatasets(datasetsResponse.data);
      } else {
        console.error("Failed to fetch CSV datasets:", datasetsResponse.error);
        toast({
          title: "Error fetching datasets",
          description: datasetsResponse.error || "Could not load CSV datasets",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectionCreated = (connection: PostgresConnection) => {
    setPostgresConnections(prev => [connection, ...prev]);
    setActiveTab('list');
  };
  
  const handleCsvUploaded = (dataset: CsvDataset) => {
    setCsvDatasets(prev => [dataset, ...prev]);
    setActiveTab('list');
  };
  
  const handleDatasetDeleted = (id: string, type: 'csv' | 'postgres') => {
    if (type === 'csv') {
      setCsvDatasets(prev => prev.filter(dataset => dataset.id !== id));
    } else {
      setPostgresConnections(prev => prev.filter(connection => connection.id !== id));
    }
  };
  
  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Datasets</h1>
            <p className="text-muted-foreground">
              Manage your data sources for validation
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full md:w-auto"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="list" className="gap-2">
              <div className="hidden sm:block">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              All Datasets
            </TabsTrigger>
            <TabsTrigger value="postgres" className="gap-2">
              <div className="hidden sm:block">
                <Database className="h-4 w-4" />
              </div>
              PostgreSQL
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2">
              <div className="hidden sm:block">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              CSV Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-0">
            <DatasetList
              postgresConnections={postgresConnections}
              csvDatasets={csvDatasets}
              onDelete={handleDatasetDeleted}
            />
          </TabsContent>
          
          <TabsContent value="postgres" className="mt-0">
            <PostgresConnectionForm onConnectionCreated={handleConnectionCreated} />
          </TabsContent>
          
          <TabsContent value="csv" className="mt-0">
            <CsvUploader onUploadComplete={handleCsvUploaded} />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default Datasets;
