
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/local-auth";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    }
  };

  if (!user?.isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">{user.id}</td>
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          {user.isAdmin ? 'Admin' : user.isArtist ? 'Artist' : 'User'}
                        </td>
                        <td className="p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold">Total Users</h3>
                  <p className="text-2xl">{users.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold">Artists</h3>
                  <p className="text-2xl">{users.filter(u => u.isArtist).length}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold">Admins</h3>
                  <p className="text-2xl">{users.filter(u => u.isAdmin).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Admin settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
