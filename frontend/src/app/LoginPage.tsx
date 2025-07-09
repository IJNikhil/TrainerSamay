// Fixed loginpage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { LogIn, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { loginWithSession } from '../api/auth'; // Use the fixed version

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      console.log("Attempting login with:", values.email);
      
      // Use the fixed session-based login
      const { user, token } = await loginWithSession(values.email, values.password);
      
      console.log("Login successful for user:", user);
      console.log("User role:", user.role);
      console.log("User ID:", user.id);
      console.log("User Token:", token);
      
      // Store token
      localStorage.setItem('authToken', token);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}! (${user.role})`,
      });
      
      // Pass the correct user to the auth context
      login(user);
      navigate('/');
      
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: err.message || 'Invalid email or password. Please try again.',
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center p-8">
            <div className="flex justify-center items-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Briefcase className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">TrainerSamay</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold">
                  <LogIn className="mr-2 h-5 w-5" />
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}