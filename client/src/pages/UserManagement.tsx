import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserPlus, Edit2, Trash2, Shield, Mail, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  organizationId: string;
}

interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  role: Role;
}

interface UserInvitation {
  id: string;
  email: string;
  organizationId: string;
  invitedBy: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
}

const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  message: z.string().optional(),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

export default function UserManagement() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const form = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      message: "",
    },
  });

  // Fetch all users in the organization
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch all roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  // Fetch user roles
  const { data: userRoles = [] } = useQuery<UserRole[]>({
    queryKey: ['/api/user-roles'],
  });

  // Fetch pending invitations
  const { data: invitations = [] } = useQuery<UserInvitation[]>({
    queryKey: ['/api/users/invitations'],
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async (data: InviteUserForm) => {
      return apiRequest('POST', '/api/users/invite', data);
    },
    onSuccess: () => {
      toast({
        title: "User Invited",
        description: "The user invitation has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/invitations'] });
      setIsInviteDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to invite user",
        variant: "destructive",
      });
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      return apiRequest('POST', `/api/users/${userId}/roles`, { roleId });
    },
    onSuccess: () => {
      toast({
        title: "Role Assigned",
        description: "The role has been assigned successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-roles'] });
      setIsRoleDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      return apiRequest('DELETE', `/api/users/${userId}/roles/${roleId}`);
    },
    onSuccess: () => {
      toast({
        title: "Role Removed",
        description: "The role has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-roles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('PUT', `/api/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      toast({
        title: "User Deactivated",
        description: "The user has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate user",
        variant: "destructive",
      });
    },
  });

  const onInviteSubmit = (data: InviteUserForm) => {
    inviteUserMutation.mutate(data);
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(ur => ur.userId === userId);
  };

  const handleAssignRole = (userId: string, roleId: string) => {
    assignRoleMutation.mutate({ userId, roleId });
  };

  const handleRemoveRole = (userId: string, roleId: string) => {
    removeRoleMutation.mutate({ userId, roleId });
  };

  const getInvitationStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      accepted: "secondary",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-8" data-testid="page-user-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, and permissions for your organization
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-invite-user">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onInviteSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="user@example.com"
                          data-testid="input-invite-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="John"
                          data-testid="input-invite-firstname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Doe"
                          data-testid="input-invite-lastname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Welcome to our security assessment platform..."
                          data-testid="input-invite-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                    data-testid="button-cancel-invite"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={inviteUserMutation.isPending}
                    data-testid="button-send-invite"
                  >
                    {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-users">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users in organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-pending-invitations">
              {invitations.filter(inv => inv.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting user acceptance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-available-roles">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured roles and permissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userRolesList = getUserRoles(user.id);
                return (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userRolesList.map((userRole) => (
                          <Badge 
                            key={userRole.roleId} 
                            variant="secondary"
                            data-testid={`badge-role-${userRole.role.name}`}
                          >
                            {userRole.role.name}
                            <button
                              onClick={() => handleRemoveRole(user.id, userRole.roleId)}
                              className="ml-1 text-xs hover:text-destructive"
                              data-testid={`button-remove-role-${userRole.roleId}`}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        <Dialog open={isRoleDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setIsRoleDialogOpen(open);
                          if (!open) setSelectedUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              data-testid={`button-assign-role-${user.id}`}
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Assign Role
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Role to {user.firstName} {user.lastName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Label>Select Role</Label>
                              <Select 
                                onValueChange={(roleId) => handleAssignRole(user.id, roleId)}
                                data-testid="select-role-assignment"
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a role..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.filter(role => 
                                    !userRolesList.some(ur => ur.roleId === role.id)
                                  ).map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.name} - {role.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "secondary" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!user.isActive}
                          onClick={() => deactivateUserMutation.mutate(user.id)}
                          data-testid={`button-deactivate-${user.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Invited By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id} data-testid={`row-invitation-${invitation.id}`}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>{invitation.invitedBy}</TableCell>
                  <TableCell>{getInvitationStatusBadge(invitation.status)}</TableCell>
                  <TableCell>{new Date(invitation.expiresAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}