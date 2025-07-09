"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2 } from 'lucide-react';
import type { User, Role } from '../../lib/types';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['admin', 'trainer']),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
  avatar: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

interface UserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user?: User | null;
  onSave: (user: User) => void;
  onDelete?: (userId: string) => void;
  currentUserId?: string;
}

export function UserDialog({ isOpen, setIsOpen, user, onSave, onDelete, currentUserId }: UserDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'trainer',
      password: '',
      avatar: '',
    },
  });

  const isEditingSelf = user?.id === currentUserId;

  useEffect(() => {
    if (isOpen) {
      if (user) {
        // form.reset({
        //   name: user.name,
        //   email: user.email,
        //   role: user.role,
        //   password: '',
        //   avatar: user.avatar || '',
        // });
        form.reset({
  name: user.name,
  email: user.email,
  role: user.role as "admin" | "trainer",
  password: '',
  avatar: user.avatar || '',
});

      } else {
        form.reset({
          name: '',
          email: '',
          role: 'trainer',
          password: '',
          avatar: '',
        });
      }
    }
  }, [user, isOpen, form]);

function onSubmit(values: z.infer<typeof formSchema>) {
  // Only include password if set (not blank)
  const userPayload: any = {
    id: user?.id,
    name: values.name,
    email: values.email,
    role: values.role as Role,
    avatar: values.avatar || `https://placehold.co/100x100.png`,
  };
  if (values.password && values.password.length >= 6) {
    userPayload.password = values.password;
  }
  onSave(userPayload);
  setIsOpen(false);
}


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update the details for this user.' : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
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
                        <Input type="password" placeholder={user ? "Leave blank to keep current" : "••••••••"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isEditingSelf}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="trainer">Trainer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter className="pt-4 mt-4 border-t">
              {user && onDelete && (
                <Button type="button" variant="destructive" onClick={() => { if(onDelete && user) { onDelete(user.id); } setIsOpen(false); }} className="mr-auto" disabled={isEditingSelf}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
