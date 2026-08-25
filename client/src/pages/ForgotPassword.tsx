import { useState } from "react";
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
import { AlertCircle, ArrowLeft, CheckCircle2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Form schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  
  // Form definition
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/users/forgot-password", values);
      
      if (response.ok) {
        const data = await response.json();
        setIsSuccess(true);
        
        // For demonstration purposes, store the token that would normally
        // be sent via email so the user can test the reset functionality
        if (data.token) {
          setResetToken(data.token);
          setUserId(data.userId);
        }
        
        toast({
          title: "Password reset requested",
          description: "Instructions provided for password reset.",
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
  
  // Function to navigate directly to the reset page with the token
  const goToResetPage = () => {
    if (resetToken) {
      setLocation(`/reset-password?token=${resetToken}`);
    }
  };
  
  // Function to copy the reset token to clipboard
  const copyTokenToClipboard = () => {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken);
      toast({
        title: "Token copied!",
        description: "Reset token copied to clipboard",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/70 px-4 py-12 sm:px-6 lg:px-8">
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
            Enter your email address and we'll provide you with a reset token to reset your password.
          </p>
        </div>

        {isSuccess ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-center">Password Reset Instructions</CardTitle>
              <CardDescription className="text-center">
                {resetToken ? (
                  <>
                    Your password reset token has been generated. In a production environment, this would 
                    be sent via email. Use the token to reset your password.
                  </>
                ) : (
                  <>
                    Password reset instructions have been sent to your email address.
                    Please check your inbox and follow the link to reset your password.
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetToken && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <Badge className="mb-2" variant="outline">Reset Token</Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={copyTokenToClipboard}
                        className="h-8 px-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <code className="block w-full overflow-x-auto whitespace-pre-wrap break-all text-xs">
                      {resetToken}
                    </code>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={goToResetPage} className="mt-2">
                      Reset My Password
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild variant="outline">
                <Link href="/login" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address below to receive a password reset token.
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
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          We'll provide a reset token to change your password.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Generating reset token..." : "Get Reset Token"}
                  </Button>
                </form>
              </Form>
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