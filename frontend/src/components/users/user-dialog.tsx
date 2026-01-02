"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

import { Trash2 } from "lucide-react";
import type { User } from "../../lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  role: z.enum(["admin", "trainer"]),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .optional()
    .or(z.literal("")),
  avatar: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
});

interface UserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user?: User | null;
  onSave: (user: User) => void;
  onDelete?: (userId: string) => void;
  currentUserId?: string;
}

export function UserDialog({
  isOpen,
  setIsOpen,
  user,
  onSave,
  onDelete,
  currentUserId,
}: UserDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "trainer",
      password: "",
      avatar: "",
    },
  });

  const isEditingSelf = user?.id === currentUserId;

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role as "admin" | "trainer",
        password: "",
        avatar: user.avatar || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "trainer",
        password: "",
        avatar: "",
      });
    }
  }, [user, isOpen, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const userPayload: Partial<User> = {
      id: user?.id,
      name: values.name,
      email: values.email,
      role: values.role,
      avatar: values.avatar || "https://placehold.co/100x100.png",
    };

    if (values.password && values.password.length >= 6) {
      userPayload.password = values.password;
    }

    onSave(userPayload as User);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 border-0 shadow-2xl overflow-hidden bg-white/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-6 pt-8">
            <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                {user ? "Edit User Profile" : "Create New User"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-base">
                {user
                ? "Manage account details and permissions."
                : "Add a new trainer or admin to the platform."}
            </DialogDescription>
            </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sarah Connor" {...field} className="h-11 bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 transition-all text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="sarah@skynet.com"
                            {...field}
                            className="h-11 bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 transition-all text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <div className="grid grid-cols-2 gap-5">
                   <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">System Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                          disabled={isEditingSelf}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-500/20">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="trainer" className="font-medium text-slate-600 focus:bg-indigo-50 focus:text-indigo-700">Trainer</SelectItem>
                            <SelectItem value="admin" className="font-medium text-slate-600 focus:bg-indigo-50 focus:text-indigo-700">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                   <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={user ? "Unchanged" : "••••••••"}
                            {...field}
                            className="h-11 bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Avatar Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        {...field}
                        className="h-11 bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 transition-all text-sm font-mono text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between gap-3">
              {user && onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (onDelete && user) onDelete(user.id);
                    setIsOpen(false);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isEditingSelf}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              ) : <div></div>}
              
              <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-11 px-6 border-slate-200 hover:bg-white hover:text-slate-900">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                    {user ? "Save Changes" : "Create Account"}
                  </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
