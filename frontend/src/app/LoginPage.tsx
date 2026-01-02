"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { motion } from "framer-motion";
import { Briefcase, LogIn, Mail, Lock } from "lucide-react";

import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { loginWithSession } from "../api/auth";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { user, token } = await loginWithSession(values.email, values.password);

      localStorage.setItem("authToken", token);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });

      login(user); // Restore auth state
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          err?.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400 via-purple-500 to-slate-900 p-4">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px]" 
        />
        <motion.div 
            animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl ring-1 ring-white/20">
          <CardHeader className="text-center p-8 pb-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="flex justify-center items-center mb-6"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-4 bg-white rounded-2xl shadow-lg ring-1 ring-gray-900/5">
                  <Briefcase className="w-10 h-10 text-indigo-600" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
              TrainerSamay
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              Welcome back! Please sign in to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0 space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Forgot password?</a>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                    >
                    {loading ? (
                        "Signing In..."
                    ) : ( // Removed animated icon for cleaner button text center
                        <span className="flex items-center justify-center">
                            Sign In <LogIn className="ml-2 h-5 w-5" />
                        </span>
                    )}
                    </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 rounded-b-xl text-center">
                <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <span className="font-semibold text-indigo-600 cursor-not-allowed">Contact Admin</span>
                </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
