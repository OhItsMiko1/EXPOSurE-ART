import React, { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from "@/lib/local-auth";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import PreferencesForm from '@/components/ui/PreferencesForm';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Heart, Settings, User, Image as ImageIcon, Sparkles, Lock } from 'lucide-react';

function ProfilePhotoUpload() {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not logged in');

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/users/${user.id}/profile-image`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload photo');
      }

      return response.json();
    },
    onSuccess: async () => {
      await checkAuth();
      toast({ title: 'Profile photo updated' });
    },
    onError: (error) => {
      setPreview(null);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    uploadMutation.mutate(file);
    e.target.value = '';
  };

  if (!user) return null;

  const initials = (user.fullName || user.username).slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-20 w-20">
        <AvatarImage src={preview || user.profileImage || undefined} alt={user.fullName || user.username} />
        <AvatarFallback className="bg-primary text-white text-xl">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Change Photo'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or GIF. Max 5MB.</p>
      </div>
    </div>
  );
}

function PremiumUpsell({ feature }: { feature: string }) {
  return (
    <div className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 rounded-lg p-4">
      <Lock className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-800">{feature} is a Premium feature</p>
        <p className="text-sm text-gray-600 mt-1 mb-3">
          Upgrade to Premium to unlock a custom background photo and a fully personalized,
          code-your-own profile page.
        </p>
        <Button size="sm" asChild>
          <Link href="/subscription">Upgrade to Premium</Link>
        </Button>
      </div>
    </div>
  );
}

function ProfileBackgroundUpload() {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not logged in');

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/users/${user.id}/profile-background`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload background');
      }

      return response.json();
    },
    onSuccess: async () => {
      await checkAuth();
      toast({ title: 'Profile background updated' });
    },
    onError: (error) => {
      setPreview(null);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    uploadMutation.mutate(file);
    e.target.value = '';
  };

  if (!user) return null;

  const backgroundUrl = preview || user.profileBackgroundImage;

  return (
    <div>
      <div
        className="h-32 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 bg-cover bg-center flex items-end p-3"
        style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {uploadMutation.isPending ? 'Uploading...' : 'Change Background'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or GIF. Max 5MB.</p>
    </div>
  );
}

function CustomProfileEditor() {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const [html, setHtml] = useState(user?.customProfileHtml ?? '');
  const [css, setCss] = useState(user?.customProfileCss ?? '');
  const [enabled, setEnabled] = useState(user?.customProfileEnabled ?? false);
  const [previewKey, setPreviewKey] = useState(0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');
      const response = await fetch(`/api/users/${user.id}/custom-profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customProfileHtml: html, customProfileCss: css, customProfileEnabled: enabled }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save custom profile');
      }
      return response.json();
    },
    onSuccess: async () => {
      await checkAuth();
      setPreviewKey((k) => k + 1);
      toast({ title: 'Custom profile saved' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <Label htmlFor="custom-profile-enabled" className="font-medium">
            Show custom profile on my public page
          </Label>
        </div>
        <Switch id="custom-profile-enabled" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="custom-html" className="text-sm font-medium">HTML</Label>
          <Textarea
            id="custom-html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<h1>Welcome to my profile!</h1>"
            className="font-mono text-xs h-64 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="custom-css" className="text-sm font-medium">CSS</Label>
          <Textarea
            id="custom-css"
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder="h1 { color: hotpink; font-family: cursive; }"
            className="font-mono text-xs h-64 mt-1"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        For safety, &lt;script&gt;, &lt;iframe&gt;, and a few other tags are automatically stripped,
        and your profile renders in a locked-down sandbox that can't run scripts at all -- no exceptions.
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save & Preview'}
        </Button>
      </div>

      {user.id && (
        <div>
          <Label className="text-sm font-medium">Live Preview</Label>
          <div className="mt-1 border rounded-lg overflow-hidden bg-white" style={{ height: 300 }}>
            <iframe
              key={previewKey}
              src={`/api/users/${user.id}/custom-profile-frame`}
              sandbox=""
              className="w-full h-full"
              title="Custom profile preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
                <CardContent className="space-y-8">
                  <div>
                    <p className="text-sm font-medium mb-3">Profile Photo</p>
                    <ProfilePhotoUpload />
                  </div>

                  <div className="pt-6 border-t">
                    <p className="text-sm font-medium mb-3">Profile Background</p>
                    {user.subscriptionTier === 'premium' ? (
                      <ProfileBackgroundUpload />
                    ) : (
                      <PremiumUpsell feature="Custom profile backgrounds" />
                    )}
                  </div>

                  <div className="pt-6 border-t">
                    <p className="text-sm font-medium mb-3">Custom Profile (HTML/CSS)</p>
                    {user.subscriptionTier === 'premium' ? (
                      <CustomProfileEditor />
                    ) : (
                      <PremiumUpsell feature="Custom profile code editing" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}