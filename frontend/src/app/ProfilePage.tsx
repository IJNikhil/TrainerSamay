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

const StatCard = ({
  icon: Icon,
  title,
  value,
  footer,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  footer: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{footer}</p>
    </CardContent>
  </Card>
);

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
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>

        {/* 📊 Performance Stats Row */}
        {user.role === "trainer" && trainerStats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Calendar}
              title="Total Sessions"
              value={trainerStats.total}
              footer="All sessions assigned to you."
            />
            <StatCard
              icon={CheckCircle}
              title="Completed"
              value={trainerStats.completed}
              footer="Successfully conducted."
            />
            <StatCard
              icon={AlertTriangle}
              title="Absences"
              value={trainerStats.absent}
              footer="Client or trainer missed."
            />
            <StatCard
              icon={BarChart3}
              title="Attendance Rate"
              value={`${trainerStats.attendanceRate.toFixed(1)}%`}
              footer="Completed vs missed sessions"
            />
          </div>
        )}

        {/* 👤 Profile Info & Avatar & Security — Single Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar */}
          <Card className="flex flex-col items-center text-center p-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-primary shadow-lg mb-4">
                <AvatarImage src={avatarPreview} alt={user.name} />
                <AvatarFallback className="text-5xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Change avatar"
              >
                <Camera className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <Badge
              variant={user.role === "admin" ? "destructive" : "secondary"}
              className="capitalize mt-2"
            >
              {user.role}
            </Badge>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-primary" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your details below.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProfileSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={user.email}
                      disabled
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaveDisabled}>
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Change your account’s password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordForm ? (
                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    For better protection, keep your password updated.
                  </p>
                  <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                    Change
                  </Button>
                </div>
              ) : (
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
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
                            <Input type="password" {...field} />
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
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowPasswordForm(false);
                          passwordForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? "Updating..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
