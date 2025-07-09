import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge"; // <-- Correct import
import { UserDialog } from "../components/users/user-dialog";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import type { User } from "../lib/types";
import { fetchUsers, createUser, updateUser, deleteUser } from "../api/users";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "../components/ui/table";

export default function UserManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      fetchUsers().then(setUsers).catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users.",
        });
      });
    }
    if (!loading && user?.role !== 'admin') {
      navigate('/');
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

const handleSaveUser = async (userToSave: any) => {
  try {
    const isNewUser = !users.some(u => u.id === userToSave.id);

    // For new users, ensure password is present and non-empty
    if (isNewUser) {
      if (!userToSave.password || userToSave.password.length < 6) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Password is required and must be at least 6 characters.",
        });
        return;
      }
      await createUser(userToSave);
      toast({
        title: "User Created",
        description: `Successfully created user ${userToSave.name}.`,
      });
    } else {
      // Remove password if blank (do not overwrite with empty string)
      const updatePayload = { ...userToSave };
      if (!updatePayload.password) delete updatePayload.password;
      await updateUser(userToSave.id, updatePayload);
      toast({
        title: "User Updated",
        description: `Successfully updated user ${userToSave.name}.`,
      });
    }
    setUsers(await fetchUsers());
  } catch (err) {
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
        description: `User has been removed from the system.`,
      });
      setUsers(await fetchUsers());
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      });
    }
  };

  if (loading || user?.role !== 'admin') {
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
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">
              Add, edit, or deactivate users. All actions are securely logged.
            </p>
          </div>
          <Button onClick={handleAddNewClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={u.avatar} alt={u.name} data-ai-hint="person avatar" />
                            <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {u.id !== user.id && (
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(u)}>Edit</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
