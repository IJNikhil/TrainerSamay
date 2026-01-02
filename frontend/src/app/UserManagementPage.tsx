"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { cn } from "../lib/utils";

import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { UserDialog } from "../components/users/user-dialog";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";

import { fetchUsers, createUser, updateUser, deleteUser } from "../api/users";

import type { User } from "../lib/types";

export default function UserManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      fetchUsers()
        .then(setUsers)
        .catch(() =>
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch users.",
          })
        );
    } else if (!loading && user?.role !== "admin") {
      navigate("/");
    }
  }, [user, loading, navigate, toast]);

  const handleAddNewClick = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsDialogOpen(true);
  };

  const handleSaveUser = async (userToSave: Partial<User> & { id?: string }) => {
    try {
      const isNewUser = !userToSave.id;

      if (isNewUser) {
        if (!userToSave.password || userToSave.password.length < 6) {
          toast({
            variant: "destructive",
            title: "Invalid Password",
            description: "Password should be at least 6 characters long.",
          });
          return;
        }
        await createUser(userToSave);
        toast({
          title: "User Created",
          description: `Successfully created ${userToSave.name}.`,
        });
      } else {
        const updatePayload = { ...userToSave };
        if (!updatePayload.password) delete updatePayload.password;

        await updateUser(userToSave.id!, updatePayload);
        toast({
          title: "User Updated",
          description: `Updated ${userToSave.name}'s details.`,
        });
      }

      const refreshedUsers = await fetchUsers();
      setUsers(refreshedUsers);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save user.",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        variant: "destructive",
        title: "User Deleted",
        description: "User has been removed.",
      });

      const refreshedUsers = await fetchUsers();
      setUsers(refreshedUsers);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      });
    }
  };

  if (loading || user?.role !== "admin") {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <p>Loading or unauthorized...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h2>
            <p className="text-slate-500 mt-1">
              Manage platform users, roles, and access controls.
            </p>
          </div>
          <Button onClick={handleAddNewClick} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                  <TableRow className="hover:bg-slate-50/50">
                    <TableHead className="w-[80px] font-semibold text-slate-700">Avatar</TableHead>
                    <TableHead className="font-semibold text-slate-700">Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Email</TableHead>
                    <TableHead className="font-semibold text-slate-700">Role</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                        <TableCell>
                          <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium font-mono">{u.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                        <TableCell className="text-slate-600">{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === "admin" ? "destructive" : "secondary"}
                            className={cn(
                              "capitalize font-medium shadow-sm border-0",
                              u.role === "admin" ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            )}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {u.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(u)}
                              className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-slate-500 h-32"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        user={editingUser}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        currentUserId={user?.id}
      />
    </AuthenticatedLayout>
  );
}
