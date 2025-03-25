import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ValidationResult } from '@/types';
import { CheckCircle, XCircle, AlertTriangle, Calendar, BarChart3, Database, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResultsTableProps {
  results: ValidationResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  const formatDuration = (ms: number | undefined) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };
  
  const handleViewDetails = (result: ValidationResult) => {
    setSelectedResult(result);
  };
  
  const renderStatusIcon = (status: 'passed' | 'warning' | 'failed' | 'error') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const renderDatasetIcon = (type: 'postgres' | 'csv') => {
    return type === 'postgres' 
      ? <Database className="h-4 w-4 mr-1 text-blue-500" />
      : <FileSpreadsheet className="h-4 w-4 mr-1 text-green-500" />;
  };
  
  const getStatusColor = (status: 'passed' | 'warning' | 'failed' | 'error') => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    }
  };
  
  const renderFailedRowsTable = () => {
    if (!selectedResult || !selectedResult.failedRows || selectedResult.failedRows.length === 0) return null;
    
    const firstRow = selectedResult.failedRows[0];
    const keys = Object.keys(firstRow).filter(key => !key.startsWith('_'));
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-3">Failed Rows Sample</h4>
        
        <div className="rounded-md border overflow-hidden">
          <ScrollArea className="max-h-[300px]">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  {keys.map((key) => (
                    <TableHead key={key} className="whitespace-nowrap">
                      {key}
                    </TableHead>
                  ))}
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedResult.failedRows.map((row, index) => (
                  <TableRow key={index}>
                    {keys.map((key) => (
                      <TableCell key={key} className="max-w-[200px] truncate">
                        {String(row[key] || '-')}
                      </TableCell>
                    ))}
                    <TableCell className="text-red-500">
                      {row._reason || 'Validation failed'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Validation Results
          </CardTitle>
          <CardDescription>
            Results from your data validation checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Check Name</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead className="hidden md:table-cell">Column</TableHead>
                      <TableHead className="hidden md:table-cell">Metrics</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {renderStatusIcon(result.status)}
                            <span className="ml-2 hidden md:inline">
                              {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{result.checkName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {renderDatasetIcon(result.dataset.type)}
                              <span>{result.dataset.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {result.table && `Table: ${result.table}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {result.column || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <span>
                              {result.metrics.passedCount !== undefined && result.metrics.failedCount !== undefined ? (
                                <>
                                  <span className="text-green-600">{result.metrics.passedCount}</span>
                                  <span className="text-muted-foreground mx-1">/</span>
                                  <span className="text-red-600">{result.metrics.failedCount}</span>
                                </>
                              ) : (
                                '-'
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(result.metrics.executionTimeMs)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(result.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(result)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-2 text-lg font-medium">No results yet</h3>
              <p className="mt-1 text-muted-foreground">
                Run validation checks to see results here
              </p>
              <Button className="mt-4" asChild>
                <a href="/validation">Create Validation Check</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Validation Result Details</DialogTitle>
            <DialogDescription>
              Detailed information about this validation check
            </DialogDescription>
          </DialogHeader>
          
          {selectedResult && (
            <ScrollArea className="flex-1 overflow-auto">
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-medium">{selectedResult.checkName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {renderDatasetIcon(selectedResult.dataset.type)}
                      {selectedResult.dataset.name}
                      {selectedResult.table && <span> • Table: {selectedResult.table}</span>}
                      {selectedResult.column && <span> • Column: {selectedResult.column}</span>}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`
                      flex items-center gap-1 px-3 py-1
                      ${getStatusColor(selectedResult.status)}
                    `}
                  >
                    {renderStatusIcon(selectedResult.status)}
                    <span>{selectedResult.status.charAt(0).toUpperCase() + selectedResult.status.slice(1)}</span>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/20 border">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-1">Total Rows</h4>
                      <p className="text-2xl font-semibold">{selectedResult.metrics.rowCount?.toLocaleString() || '-'}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/20 border">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-1">Pass / Fail</h4>
                      <p className="text-2xl font-semibold">
                        <span className="text-green-600">{selectedResult.metrics.passedCount?.toLocaleString() || '-'}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-red-600">{selectedResult.metrics.failedCount?.toLocaleString() || '-'}</span>
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/20 border">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-1">Execution Time</h4>
                      <p className="text-2xl font-semibold">{formatDuration(selectedResult.metrics.executionTimeMs)}</p>
                    </CardContent>
                  </Card>
                </div>
                
                {(selectedResult.status === 'failed' || selectedResult.status === 'warning') && renderFailedRowsTable()}
                
                {selectedResult.status === 'error' && selectedResult.errorMessage && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Error Details</h4>
                    <div className="rounded-md bg-red-50 p-4 text-red-800">
                      {selectedResult.errorMessage}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground justify-end">
                  <Calendar className="h-3 w-3 mr-1" />
                  Run on {formatDate(selectedResult.createdAt)}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResultsTable;
