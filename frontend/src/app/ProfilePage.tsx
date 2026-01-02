"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";

import {
  ShieldCheck,
  UserCircle,
  Camera,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
} from "lucide-react";

import type { Session } from "../lib/types";
import { fetchSessions } from "../api/sessions";
import { updateUser, changePassword } from "../api/users";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import { processSessions } from "../lib/session-utils";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ProfilePage() {
  const { user, updateUser: updateUserContext } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user && user.role === "trainer") {
      setLoadingSessions(true);
      fetchSessions(user.id)
        .then((data) => setSessions(data))
        .catch((err) =>
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message || "Failed to load sessions.",
          })
        )
        .finally(() => setLoadingSessions(false));
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name });
      setAvatarPreview(user.avatar ?? "");
    }
  }, [user, form]);

  const trainerStats = useMemo(() => {
    if (!user || user.role !== "trainer" || loadingSessions) return null;
    const processed = processSessions(sessions);
    const mySessions = processed.filter(
      (s) => String(s.trainerId) === String(user.id)
    );

    const total = mySessions.length;
    const completed = mySessions.filter((s) => s.status === "Completed").length;
    const absent = mySessions.filter((s) => s.status === "Absent").length;
    const feedbackSubmitted = mySessions.filter((s) => !!s.notes?.trim()).length;

    const relevantTotal = completed + absent;
    const attendanceRate =
      relevantTotal > 0 ? (completed / relevantTotal) * 100 : 100;

    return { total, completed, absent, feedbackSubmitted, attendanceRate };
  }, [user, sessions, loadingSessions]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsAvatarChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    const changes: any = {};
    if (values.name !== user.name) changes.name = values.name;
    if (isAvatarChanged && avatarPreview && avatarPreview !== user.avatar) {
      changes.avatar = avatarPreview;
    }

    if (Object.keys(changes).length === 0) {
      return toast({ title: "No changes", description: "Nothing to update." });
    }

    try {
      await updateUser(user.id, changes);
      updateUserContext?.({ ...user, ...changes });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved.",
      });
      form.reset({ name: values.name });
      setIsAvatarChanged(false);
    } catch {
      toast({
        title: "Update Failed",
        description: "Could not update your profile.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (
    values: z.infer<typeof passwordFormSchema>
  ) => {
    if (!user) return;
    setPasswordLoading(true);
    try {
      await changePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast({
        title: "Password Changed",
        description: "Your password was updated successfully.",
      });
      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (err: any) {
      toast({
        title: "Change Failed",
        description: err.message || "Could not change your password.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  const isSaveDisabled =
    (!form.formState.isDirty && !isAvatarChanged) || form.formState.isSubmitting;

  return (
    <AuthenticatedLayout>
      <div className="flex-1 w-full flex flex-col min-h-screen pb-12">
        {/* Premium Hero Header */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 pb-32 -mt-6 -mx-4 md:-mx-8 px-4 md:px-8 pt-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400">
                <UserCircle className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Account Management</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                My Profile
              </h2>
              <p className="text-slate-400 text-lg font-medium max-w-2xl pt-2">
                Manage your personal details, security settings, and view your performance stats.
              </p>
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck className="h-64 w-64 text-white" />
          </div>
        </div>

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 -mt-24 relative z-20 space-y-8">

        {/* 📊 Performance Stats Row (Trainers Only) */}
        {user.role === "trainer" && trainerStats && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-[4px] border-l-indigo-500 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide">Total Sessions</CardTitle>
                    <Calendar className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{trainerStats.total}</div>
                </CardContent>
            </Card>
            <Card className="border-l-[4px] border-l-emerald-500 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{trainerStats.completed}</div>
                </CardContent>
            </Card>
             <Card className="border-l-[4px] border-l-amber-500 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide">Absences</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{trainerStats.absent}</div>
                </CardContent>
            </Card>
             <Card className="border-l-[4px] border-l-blue-500 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide">Attendance Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{trainerStats.attendanceRate.toFixed(1)}%</div>
                </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT COLUMN: Identity Card */}
          <div className="lg:col-span-1 space-y-6">
              <Card className="relative overflow-hidden border-slate-200 shadow-sm bg-white">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                <div className="px-6 pb-6 text-center -mt-12">
                   <div className="relative inline-block group">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-white">
                        <AvatarImage src={avatarPreview} alt={user.name} />
                        <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-600">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700 transition-colors"
                        title="Upload new photo"
                      >
                         <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                   </div>
                   
                   <h3 className="mt-3 text-xl font-bold text-slate-900">{user.name}</h3>
                   <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                   
                   <div className="mt-4 flex justify-center">
                       <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                          {user.role}
                       </Badge>
                   </div>
                </div>
              </Card>
          </div>

          {/* RIGHT COLUMN: Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-lg font-bold text-slate-800">Personal Information</CardTitle>
                  </div>
                  <CardDescription>Update your display name and basic details.</CardDescription>
                </CardHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleProfileSubmit)}>
                    <CardContent className="space-y-4 pt-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="bg-slate-50 border-slate-200 focus:border-indigo-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <Label className="text-slate-700">Email Address</Label>
                        <Input
                          value={user.email}
                          disabled
                          readOnly
                          className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed mt-1.5"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/30 border-t border-slate-100 py-4 flex justify-end">
                      <Button type="submit" disabled={isSaveDisabled} className={isSaveDisabled ? "opacity-50" : "bg-indigo-600 hover:bg-indigo-700"}>
                        Save Changes
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
            </Card>

            {/* Security Settings */}
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-lg font-bold text-slate-800">Security Settings</CardTitle>
                  </div>
                  <CardDescription>Manage your password and security preferences.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                   {!showPasswordForm ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="space-y-1">
                         <p className="font-semibold text-slate-900">Password</p>
                         <p className="text-sm text-slate-500">Last changed recently</p>
                      </div>
                      <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="border-slate-200 hover:bg-white hover:text-indigo-600">
                        Change Password
                      </Button>
                    </div>
                   ) : (
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} className="bg-slate-50" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} className="bg-slate-50" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} className="bg-slate-50" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <Button type="button" variant="ghost" onClick={() => { setShowPasswordForm(false); passwordForm.reset(); }}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={passwordLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {passwordLoading ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                   )}
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </AuthenticatedLayout>
  );
}
