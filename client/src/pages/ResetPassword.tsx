import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle2, Lock } from "lucide-react";

// Form schema with password validation
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [location]);

  // Form definition
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
  });

  // Verify token first
  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await apiRequest("GET", `/api/users/verify-reset-token/${token}`);
          if (!response.ok) {
            const data = await response.json();
            setError(data.message || "Invalid or expired reset token. Please request a new one.");
            setToken(null);
          }
        } catch (err) {
          console.error("Token verification error:", err);
          setError("An error occurred while verifying the token. Please try again.");
          setToken(null);
        }
      };
      verifyToken();
    }
  }, [token]);

  // Handle form submission
  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      setError("Missing reset token. Please request a new password reset.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/users/reset-password", {
        token,
        newPassword: values.password
      });
      
      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password reset successful",
          description: "Your password has been updated successfully. You can now log in with your new password.",
        });
      } else {
        const data = await response.json();
        setError(data.message || "Something went wrong. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-wider text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
                EXPOSurE
              </span>
              <span className="text-primary">.ART</span>
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a new password for your account
          </p>
        </div>

        {isSuccess ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-center">Password Reset Complete</CardTitle>
              <CardDescription className="text-center">
                Your password has been reset successfully.
                You can now log in to your account with your new password.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/login">
                  Continue to Login
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <Lock className="h-8 w-8 text-primary/80" />
              </div>
              <CardTitle>Create New Password</CardTitle>
              <CardDescription>
                Enter a new password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {!token ? (
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-center text-sm text-gray-500">
                    The password reset link is invalid or has expired. 
                    Please request a new password reset.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/forgot-password">
                      Request New Reset Link
                    </Link>
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your new password" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            At least 8 characters with numbers and uppercase letters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Confirm your new password" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Resetting Password..." : "Reset Password"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}