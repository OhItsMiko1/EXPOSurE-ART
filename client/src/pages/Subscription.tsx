import React from 'react';
import SubscriptionPlans from '@/components/ui/SubscriptionPlans';
import { useAuth } from "@/lib/local-auth";
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CreditCard, ArrowRight } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
        Artist Subscription Plans
      </h1>
      
      {!user && (
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="mb-4">Please log in or create an account to subscribe to a plan.</p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      )}
      
      {user && (
        <div className="mb-10 max-w-md mx-auto">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-fuchsia-500" />
                Direct Checkout
              </CardTitle>
              <CardDescription>
                Skip the selection process and checkout directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                If you prefer to upgrade to Premium directly, you can complete your payment on our secure checkout page.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600">
                <Link href="/checkout" className="flex items-center justify-center">
                  Go to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      <SubscriptionPlans />
    </div>
  );
}