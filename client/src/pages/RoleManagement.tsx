import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, Plus, Edit2, Trash2, Settings, Users, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Role {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: Permission;
}

const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().min(1, "Description is required"),
});

type CreateRoleForm = z.infer<typeof createRoleSchema>;

const PERMISSION_CATEGORIES = {
  projects: "Project Management",
  findings: "Finding Management", 
  users: "User Management",
  reports: "Report Management",
  system: "System Administration"
};

export default function RoleManagement() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  const form = useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editForm = useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch all roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  // Fetch all permissions
  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ['/api/permissions'],
  });

  // Fetch role permissions
  const { data: rolePermissions = [] } = useQuery<RolePermission[]>({
    queryKey: ['/api/role-permissions'],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleForm) => {
      return apiRequest('POST', '/api/roles', data);
    },
    onSuccess: () => {
      toast({
        title: "Role Created",
        description: "The role has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateRoleForm }) => {
      return apiRequest('PUT', `/api/roles/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "The role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return apiRequest('DELETE', `/api/roles/${roleId}`);
    },
    onSuccess: () => {
      toast({
        title: "Role Deleted",
        description: "The role has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  // Add permission to role mutation
  const addPermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      return apiRequest('POST', `/api/roles/${roleId}/permissions`, { permissionId });
    },
    onSuccess: () => {
      toast({
        title: "Permission Added",
        description: "The permission has been added to the role.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/role-permissions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add permission",
        variant: "destructive",
      });
    },
  });

  // Remove permission from role mutation
  const removePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      return apiRequest('DELETE', `/api/roles/${roleId}/permissions/${permissionId}`);
    },
    onSuccess: () => {
      toast({
        title: "Permission Removed",
        description: "The permission has been removed from the role.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/role-permissions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove permission",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: CreateRoleForm) => {
    createRoleMutation.mutate(data);
  };

  const onEditSubmit = (data: CreateRoleForm) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, data });
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    editForm.setValue("name", role.name);
    editForm.setValue("description", role.description);
    setIsEditDialogOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsDialogOpen(true);
  };

  const getRolePermissions = (roleId: string) => {
    return rolePermissions.filter(rp => rp.roleId === roleId);
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions.some(rp => rp.roleId === roleId && rp.permissionId === permissionId);
  };

  const handlePermissionToggle = (roleId: string, permissionId: string, isChecked: boolean) => {
    if (isChecked) {
      addPermissionMutation.mutate({ roleId, permissionId });
    } else {
      removePermissionMutation.mutate({ roleId, permissionId });
    }
  };

  const groupPermissionsByCategory = () => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      projects: FileText,
      findings: Shield,
      users: Users,
      reports: FileText,
      system: Settings
    };
    const IconComponent = icons[category] || Shield;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-8" data-testid="page-role-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Role Management</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage roles with granular permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-role">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Senior Researcher"
                          data-testid="input-role-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the role and its responsibilities..."
                          data-testid="input-role-description"
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
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createRoleMutation.isPending}
                    data-testid="button-save-role"
                  >
                    {createRoleMutation.isPending ? "Creating..." : "Create Role"}
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
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-roles">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured roles in organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Permissions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-permissions">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              System permissions available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-permission-categories">
              {Object.keys(groupPermissionsByCategory()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Permission groupings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const rolePerms = getRolePermissions(role.id);
                return (
                  <TableRow key={role.id} data-testid={`row-role-${role.id}`}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rolePerms.slice(0, 3).map((rp) => (
                          <Badge 
                            key={rp.permissionId} 
                            variant="outline"
                            data-testid={`badge-permission-${rp.permission.name}`}
                          >
                            {rp.permission.name}
                          </Badge>
                        ))}
                        {rolePerms.length > 3 && (
                          <Badge variant="secondary">
                            +{rolePerms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          data-testid={`button-edit-role-${role.id}`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManagePermissions(role)}
                          data-testid={`button-manage-permissions-${role.id}`}
                        >
                          <Shield className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteRoleMutation.mutate(role.id)}
                          data-testid={`button-delete-role-${role.id}`}
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

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Senior Researcher"
                        data-testid="input-edit-role-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe the role and its responsibilities..."
                        data-testid="input-edit-role-description"
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
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateRoleMutation.isPending}
                  data-testid="button-update-role"
                >
                  {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions - {selectedRole?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-6">
              {Object.entries(groupPermissionsByCategory()).map(([category, categoryPermissions]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <h3 className="text-lg font-medium">
                      {PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES] || category}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 ml-6">
                    {categoryPermissions.map((permission) => (
                      <div 
                        key={permission.id} 
                        className="flex items-center space-x-3 p-3 border rounded-lg"
                        data-testid={`permission-item-${permission.id}`}
                      >
                        <Checkbox
                          id={permission.id}
                          checked={hasPermission(selectedRole.id, permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(selectedRole.id, permission.id, !!checked)
                          }
                          data-testid={`checkbox-permission-${permission.id}`}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={permission.id} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsPermissionsDialogOpen(false)}
                  data-testid="button-close-permissions"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}