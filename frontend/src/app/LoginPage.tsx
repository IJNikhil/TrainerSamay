"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Briefcase, ArrowRight } from "lucide-react";

import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { loginWithSession } from "../api/auth";

import { Button } from "../components/ui/button";
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
        title: "Welcome back",
        description: `Signed in as ${user.name}`,
      });

      login(user);
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: err?.message || "Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Brand/Hero (Hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 text-white max-w-lg">
            <div className="mb-8 p-4 bg-white/10 w-fit rounded-2xl backdrop-blur-sm border border-white/10">
                <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
                Manage your training sessions efficiently.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
                TrainerSamay provides a complete suite of tools to schedule, track, and optimize your organization's training programs.
            </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-sm space-y-10">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in</h2>
                <p className="text-slate-500 mt-2 text-sm">
                    Enter your credentials to access the dashboard.
                </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@company.com"
                          className="h-11 bg-white border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                          {...field}
                        />
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
                         <FormLabel className="text-slate-700">Password</FormLabel>
                         <button type="button" className="text-xs font-medium text-slate-900 hover:underline">Forgot password?</button>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          className="h-11 bg-white border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm hover:shadow-md mt-4"
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <span className="flex items-center justify-center">
                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>
            
            <p className="text-center text-sm text-slate-500">
                Don't have an account? <span className="font-semibold text-slate-900 cursor-not-allowed">Contact Support</span>
            </p>
        </div>
      </div>
    </div>
  );
}
