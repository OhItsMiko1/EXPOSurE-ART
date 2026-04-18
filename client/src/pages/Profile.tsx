import React from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PreferencesForm from '@/components/ui/PreferencesForm';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Heart, Settings, User } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Profile</h1>
        <p className="mb-6">Please log in to view your profile</p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
            {user.fullName || user.username}
          </h1>
          <p className="text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex mt-4 md:mt-0">
          <Button variant="outline" className="mr-2" onClick={logout}>
            Log Out
          </Button>
          <Button asChild>
            <Link href="/subscription">
              Manage Subscription
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Username</p>
                <p className="text-muted-foreground">{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Email</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Subscription</p>
                <div className="flex items-center">
                  <Badge variant={user.subscriptionTier === 'premium' ? 'default' : 'outline'}>
                    {user.subscriptionTier === 'premium' ? 'Premium' : 'Free'}
                  </Badge>
                  {user.subscriptionTier === 'premium' && user.subscriptionEndDate && (
                    <span className="text-xs text-muted-foreground ml-2">
                      Expires: {new Date(user.subscriptionEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {user.isArtist && (
                <div>
                  <p className="text-sm font-medium mb-1">Artist Status</p>
                  <Badge className="bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500">
                    Artist
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs defaultValue="preferences">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="preferences" className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                Art Preferences
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preferences">
              <PreferencesForm />
            </TabsContent>
            
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>
                    View and manage your current subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Your current plan: <strong>{user.subscriptionTier === 'premium' ? 'Premium' : 'Free'}</strong></p>
                  
                  {user.subscriptionTier === 'premium' && user.subscriptionEndDate && (
                    <p>Your premium subscription is active until {new Date(user.subscriptionEndDate).toLocaleDateString()}</p>
                  )}
                  
                  <Button asChild>
                    <Link href="/subscription">
                      Manage Subscription
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Update your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Account settings functionality coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}