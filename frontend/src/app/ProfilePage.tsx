import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Label } from '../components/ui/label';
import { ShieldCheck, UserCircle, Camera, TrendingUp, CheckCircle, AlertTriangle, BarChart3, Calendar, ClipboardCheck } from 'lucide-react';
import type { Session } from '../lib/types';

import AuthenticatedLayout from '../components/layouts/authenticated-layout';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { processSessions } from '../lib/session-utils';
import { fetchSessions } from '../api/sessions';
import { updateUser, changePassword } from '../api/users';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const StatCard = ({ icon: Icon, title, value, footer }: { icon: React.ElementType, title: string, value: string | number, footer: string }) => (
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
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Show/hide password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Profile form
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

useEffect(() => {
  if (user && user.role === 'trainer') {
    setLoadingSessions(true);
    fetchSessions(user.id)
      .then(data => {
        console.log("Fetched sessions:", data);
        setSessions(data);
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message || 'Failed to load sessions from server.',
        });
      })
      .finally(() => setLoadingSessions(false));
  }
}, [user, toast]);



  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
      });
      setAvatarPreview(user.avatar ?? "");
    }
  }, [user, form]);

  const trainerStats = useMemo(() => {
      if (!user || user.role !== 'trainer' || loadingSessions) return null;

      const processed = processSessions(sessions);

const mySessions = processed.filter(s => String(s.trainerId) === String(user.id));

      const total = mySessions.length;
      const completed = mySessions.filter(s => s.status === 'Completed').length;
      const absent = mySessions.filter(s => s.status === 'Absent').length;
      const feedbackSubmitted = mySessions.filter(s => s.notes && s.notes.trim() !== '').length;

      const relevantTotal = completed + absent;
      const attendanceRate = relevantTotal > 0 ? ((completed / relevantTotal) * 100) : 100;

      return { total, completed, absent, feedbackSubmitted, attendanceRate };
  }, [user, sessions, loadingSessions]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsAvatarChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;

    const updatedData: { [key: string]: any } = {};
    if (values.name !== user.name) updatedData.name = values.name;
    if (isAvatarChanged && avatarPreview && avatarPreview !== user.avatar) updatedData.avatar = avatarPreview;

    if (Object.keys(updatedData).length === 0) {
      toast({ title: 'No changes', description: 'Nothing to update.' });
      return;
    }

    try {
      await updateUser(user.id, updatedData);
      if (updateUserContext) updateUserContext({ ...user, ...updatedData });
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
      form.reset({ ...values });
      setIsAvatarChanged(false);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile in the database.',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordChange = async (values: z.infer<typeof passwordFormSchema>) => {
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
    } catch (error: any) {
      toast({
        title: "Change Failed",
        description: error?.message || "Could not change your password.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return null; 
  }

  const isSaveDisabled = (!form.formState.isDirty && !isAvatarChanged) || form.formState.isSubmitting;

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="flex flex-col items-center text-center p-8">
                <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-primary shadow-lg mb-4">
                      <AvatarImage src={avatarPreview} alt={user.name} />
                      <AvatarFallback className="text-5xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <button
                        onClick={handleAvatarClick}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Change profile picture"
                    >
                        <Camera className="w-8 h-8"/>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif"
                        className="hidden"
                    />
                </div>
                <h3 className="text-2xl font-bold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize text-base mt-4">
                  {user.role}
                </Badge>
            </Card>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {user.role === 'trainer' && trainerStats && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            <CardTitle>My Statistics</CardTitle>
                        </div>
                        <CardDescription>Your performance summary.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <StatCard icon={Calendar} title="Total Sessions" value={trainerStats.total} footer="All sessions assigned to you." />
                        <StatCard icon={CheckCircle} title="Completed Sessions" value={trainerStats.completed} footer="Successfully conducted sessions." />
                        <StatCard icon={AlertTriangle} title="Absences" value={trainerStats.absent} footer="Sessions where client was absent." />
                        <StatCard icon={BarChart3} title="Attendance Rate" value={`${trainerStats.attendanceRate.toFixed(1)}%`} footer="Based on completed vs. absences." />
                    </CardContent>
                </Card>
            )}

            <Card>
              <CardHeader>
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-6 h-6 text-primary" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input type="email" value={user.email} readOnly disabled className="cursor-not-allowed bg-muted/50" />
                         <p className="text-sm text-muted-foreground">
                            Your email address cannot be changed.
                        </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaveDisabled}>Save Changes</Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <CardTitle>Security & Data Protection</CardTitle>
                </div>
                <CardDescription>Change your password below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Password</Label>
                  {!showPasswordForm ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        For your security, you can change your password at any time.
                      </p>
                      <Button variant="outline" type="button" onClick={() => setShowPasswordForm(true)}>
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="current-password" {...field} />
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
                                <Input type="password" autoComplete="new-password" {...field} />
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
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={
                              passwordLoading ||
                              !passwordForm.formState.isDirty ||
                              passwordForm.formState.isSubmitting
                            }
                          >
                            {passwordLoading ? "Changing..." : "Change Password"}
                          </Button>
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
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Data Protection</Label>
                  <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/20">
                    We are committed to protecting your data. All sensitive information is encrypted in transit and at rest. For more details, please see our Privacy Policy (not yet implemented).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
