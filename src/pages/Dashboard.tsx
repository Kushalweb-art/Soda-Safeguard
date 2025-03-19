
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight, ArrowUpRight, BarChart3, Database, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { fetchValidationResults } from '@/utils/api';
import { ValidationResult } from '@/types';
import PageTransition from '@/components/ui/PageTransition';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const response = await fetchValidationResults();
      if (response.success && response.data) {
        setResults(response.data);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Calculate summary statistics
  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.status === 'passed').length;
  const failedChecks = results.filter(r => r.status === 'failed').length;
  
  // Prepare chart data
  const statusData = [
    { name: 'Passed', value: passedChecks, color: '#10b981' },
    { name: 'Failed', value: failedChecks, color: '#ef4444' },
  ];
  
  // Generate time trend data based on actual results
  const timeTrendData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM d');
    
    // Filter results for this day
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayResults = results.filter(result => {
      const resultDate = new Date(result.createdAt);
      return isWithinInterval(resultDate, { start: dayStart, end: dayEnd });
    });
    
    return {
      date: dateStr,
      passed: dayResults.filter(r => r.status === 'passed').length,
      failed: dayResults.filter(r => r.status === 'failed').length,
    };
  }).reverse();
  
  const quickLinks = [
    { 
      title: 'Add Dataset', 
      description: 'Connect to a database or upload CSV', 
      icon: Database, 
      action: () => navigate('/datasets') 
    },
    { 
      title: 'Create Validation', 
      description: 'Define data quality checks', 
      icon: CheckCircle, 
      action: () => navigate('/validation') 
    },
    { 
      title: 'View Results', 
      description: 'See validation outcomes', 
      icon: BarChart3, 
      action: () => navigate('/results') 
    },
  ];
  
  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Soda Safeguard, your data quality platform
          </p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, i) => (
            <Card key={i} className="overflow-hidden group glass-panel glass-panel-hover">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <link.icon size={20} />
                </div>
                <CardTitle className="text-lg">{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  variant="ghost" 
                  onClick={link.action}
                  className="p-0 h-auto text-primary group-hover:text-primary/80"
                >
                  <span>Get started</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel glass-panel-hover">
            <CardHeader>
              <CardTitle className="text-lg">Validation Status</CardTitle>
              <CardDescription>Distribution of check results</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
  
          <Card className="glass-panel glass-panel-hover">
            <CardHeader>
              <CardTitle className="text-lg">Validation Trend</CardTitle>
              <CardDescription>Last 7 days activity</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeTrendData}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="passed" name="Passed" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" name="Failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
  
        <Card className="glass-panel glass-panel-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Validation Results</CardTitle>
                <CardDescription>Latest data quality check outcomes</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/results')}>
                View all <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.slice(0, 5).map((result) => (
                  <div key={result.id} className="flex items-center justify-between px-4 py-3 bg-muted/20 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium">{result.checkName}</span>
                      <span className="text-sm text-muted-foreground">
                        {result.dataset.name} • {result.column && `Column: ${result.column}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.status === 'passed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'passed' ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted" />
                <h3 className="mt-2 text-lg font-medium">No results yet</h3>
                <p className="mt-1 text-muted-foreground">
                  Start by creating validation checks for your data
                </p>
                <Button className="mt-4" onClick={() => navigate('/validation')}>
                  Create validation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
