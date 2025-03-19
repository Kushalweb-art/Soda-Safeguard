
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Database, ServerCrash, KeyRound, Server, ShieldCheck } from 'lucide-react';
import { createPostgresConnection, testPostgresConnection } from '@/utils/api';
import { PostgresConnection } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, 'Connection name is required'),
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().positive().default(5432),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface PostgresConnectionFormProps {
  onConnectionCreated: (connection: PostgresConnection) => void;
}

const PostgresConnectionForm: React.FC<PostgresConnectionFormProps> = ({ onConnectionCreated }) => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
    },
  });
  
  const handleTestConnection = async () => {
    const formValid = await form.trigger();
    if (!formValid) return;
    
    const values = form.getValues();
    setIsTesting(true);
    
    try {
      // Create a complete connection object with all required properties
      const connectionData = {
        name: values.name,
        host: values.host,
        port: values.port,
        database: values.database,
        username: values.username,
        password: values.password,
        tables: []
      };
      
      const response = await testPostgresConnection(connectionData);
      if (response.success) {
        toast({
          title: 'Connection successful',
          description: 'Successfully connected to the database and fetched schema',
        });
      } else {
        toast({
          title: 'Connection failed',
          description: response.error || 'Failed to connect to the database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Failed to connect to the database. Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    setIsCreating(true);
    
    try {
      // Create a complete connection object with all required properties
      const connectionData = {
        name: values.name,
        host: values.host,
        port: values.port,
        database: values.database,
        username: values.username,
        password: values.password,
        tables: []
      };
      
      const response = await createPostgresConnection(connectionData);
      if (response.success && response.data) {
        toast({
          title: 'Connection created',
          description: `${values.name} has been added with ${response.data.tables?.length || 0} tables`,
        });
        onConnectionCreated(response.data);
        form.reset();
      }
    } catch (error) {
      toast({
        title: 'Error creating connection',
        description: 'There was a problem saving your connection',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="h-5 w-5" />
          Connect to PostgreSQL
        </CardTitle>
        <CardDescription>
          Add a PostgreSQL database connection for data validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Production Database" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Server className="h-4 w-4 text-muted-foreground absolute left-3" />
                        <Input
                          className="pl-10"
                          placeholder="localhost or db.example.com"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center relative">
                      <Database className="h-4 w-4 text-muted-foreground absolute left-3" />
                      <Input
                        className="pl-10"
                        placeholder="postgres"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <KeyRound className="h-4 w-4 text-muted-foreground absolute left-3" />
                        <Input
                          className="pl-10"
                          placeholder="postgres"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground absolute left-3" />
                        <Input
                          className="pl-10"
                          type="password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || isCreating}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              
              <Button type="submit" disabled={isTesting || isCreating}>
                {isCreating ? 'Creating...' : 'Save Connection'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PostgresConnectionForm;
