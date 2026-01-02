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
          <Button onClick={handleAddNewClick} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="w-[100px] pl-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Avatar</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Name</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Email</TableHead>
                <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Role</TableHead>
                <TableHead className="text-right pr-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.id} className="group hover:bg-indigo-50/30 transition-colors h-16 border-slate-100">
                  <TableCell className="pl-6 font-medium">
                    <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm group-hover:ring-indigo-200 transition-all">
                      <AvatarImage src={userItem.avatar} alt={userItem.name} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                        {userItem.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{userItem.name}</div>
                  </TableCell>
                  <TableCell className="text-slate-500">{userItem.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium border shadow-none",
                        userItem.role === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}
                    >
                      {userItem.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(userItem)}
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 font-medium"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
