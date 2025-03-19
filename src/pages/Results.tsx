
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, FileDown } from 'lucide-react';
import ResultsTable from '@/components/results/ResultsTable';
import { ValidationResult } from '@/types';
import { fetchValidationResults } from '@/utils/api';
import PageTransition from '@/components/ui/PageTransition';

const Results = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadResults();
  }, []);
  
  const loadResults = async () => {
    setLoading(true);
    
    try {
      const response = await fetchValidationResults();
      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error loading results',
        description: 'Failed to load validation results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportResults = () => {
    if (results.length === 0) {
      toast({
        title: 'No results to export',
        description: 'There are no validation results to export',
        variant: 'destructive',
      });
      return;
    }
    
    // Create CSV content
    const headers = [
      'Check Name',
      'Status',
      'Dataset',
      'Type',
      'Table',
      'Column',
      'Total Rows',
      'Passed',
      'Failed',
      'Execution Time (ms)',
      'Created At',
    ];
    
    const rows = results.map(result => [
      result.checkName,
      result.status,
      result.dataset.name,
      result.dataset.type,
      result.table || '',
      result.column || '',
      result.metrics.rowCount || 0,
      result.metrics.passedCount || 0,
      result.metrics.failedCount || 0,
      result.metrics.executionTimeMs || 0,
      result.createdAt,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `validation-results-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export successful',
      description: 'Validation results have been exported to CSV',
    });
  };
  
  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Results</h1>
            <p className="text-muted-foreground">
              View and analyze data validation results
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadResults}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportResults}
              disabled={results.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <ResultsTable results={results} />
      </div>
    </PageTransition>
  );
};

export default Results;
