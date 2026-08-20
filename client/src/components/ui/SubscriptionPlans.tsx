import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from "@/lib/local-auth";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Star, Sparkles, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

// Payment form component
const PaymentForm = ({ onSuccess, onError, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/subscription',
        },
        redirect: 'if_required'
      });
      
      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment');
        onError(error);
      } else {
        // Payment succeeded
        onSuccess();
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="text-destructive mb-4 text-sm">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing} 
          className="flex-1 bg-gradient-to-r from-fuchsia-600 to-pink-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay $10'
          )}
        </Button>
      </div>
    </form>
  );
};

export default function SubscriptionPlans() {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(
    (user?.subscriptionTier as 'free' | 'premium') || 'free'
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

  // Get payment intent when needed
  const createPaymentIntent = async () => {
    if (!user) return;
    
    try {
      setIsInitiatingPayment(true);
      const response = await apiRequest('/api/create-payment-intent', { 
        method: 'POST',
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentModalOpen(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: 'Payment Error',
        description: 'There was a problem setting up the payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  // Mutation for free tier subscription
  const { isPending: isSubscribing, mutate: updateSubscription } = useMutation({
    mutationFn: async (tier: 'free' | 'premium') => {
      if (!user) throw new Error('User not authenticated');
      return apiRequest(`/api/users/${user.id}/subscription`, {
        method: 'POST',
        body: JSON.stringify({
          subscriptionTier: tier
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      checkAuth();
      toast({
        title: 'Subscription updated!',
        description: selectedPlan === 'premium' 
          ? 'You are now a premium member. Enjoy all the exclusive features!' 
          : 'Your subscription has been updated to the free tier.',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Subscription update failed',
        description: 'There was an error updating your subscription. Please try again.',
        variant: 'destructive'
      });
      console.error('Subscription error:', error);
    }
  });

  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in or register to manage your subscription.',
        variant: 'destructive'
      });
      return;
    }
    
    if (selectedPlan === 'free') {
      // Free tier doesn't need payment
      updateSubscription('free');
    } else {
      // Premium tier needs payment
      createPaymentIntent();
    }
  };
  
  const handlePaymentSuccess = () => {
    // Update subscription after successful payment
    updateSubscription('premium');
    setPaymentModalOpen(false);
  };
  
  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: 'Payment failed',
      description: error.message || 'There was an error processing your payment. Please try again.',
      variant: 'destructive'
    });
    // Keep the modal open to let the user try again
  };

  const isCurrentPlan = (plan: 'free' | 'premium') => user?.subscriptionTier === plan;
  
  const stripe_options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#FF1493', // Fuchsia
        colorBackground: '#ffffff',
        colorText: '#333333',
        colorDanger: '#FF0000',
        fontFamily: 'Poppins, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };
  
  return (
    <div className="py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-transparent bg-clip-text">
          Artist Subscription Plans
        </h2>
        <p className="text-lg text-muted-foreground">
          Choose the plan that fits your creative journey
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={`relative border-2 ${selectedPlan === 'free' ? 'border-primary' : 'border-border'} transition-all hover:shadow-lg`}>
          {isCurrentPlan('free') && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              Current Plan
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Basic Plan <Star className="h-5 w-5 text-yellow-500" />
            </CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Free</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Basic profile visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Upload up to 10 artworks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Receive commission requests</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Standard search visibility</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant={selectedPlan === 'free' ? 'secondary' : 'outline'} 
              className="w-full"
              onClick={() => setSelectedPlan('free')}
              disabled={isCurrentPlan('free')}
            >
              {isCurrentPlan('free') ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={`relative border-2 ${selectedPlan === 'premium' ? 'border-primary' : 'border-border'} transition-all hover:shadow-lg`}>
          {isCurrentPlan('premium') && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              Current Plan
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Premium Plan <Sparkles className="h-5 w-5 text-fuchsia-500" />
            </CardTitle>
            <CardDescription>Enhanced visibility & features</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$10</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Featured artist placement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Unlimited artwork uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Priority in commission listings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Analytics dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Reduced platform fees (10% vs 15%)</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant={selectedPlan === 'premium' ? 'secondary' : 'default'} 
              className={`w-full ${selectedPlan !== 'premium' ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700' : ''}`}
              onClick={() => setSelectedPlan('premium')}
              disabled={isCurrentPlan('premium')}
            >
              {isCurrentPlan('premium') ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {selectedPlan !== user?.subscriptionTier && (
        <div className="mt-8 text-center">
          <Button 
            size="lg" 
            onClick={handleSubscribe}
            disabled={isSubscribing || selectedPlan === user?.subscriptionTier || isInitiatingPayment}
            className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
          >
            {isSubscribing || isInitiatingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isInitiatingPayment ? 'Preparing payment...' : 'Updating...'}
              </>
            ) : (
              <>
                {selectedPlan === 'premium' && <CreditCard className="mr-2 h-4 w-4" />}
                {`Switch to ${selectedPlan === 'free' ? 'Free' : 'Premium'}`}
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subscribe to Premium Plan</DialogTitle>
            <DialogDescription>
              Complete your payment to upgrade to the Premium Plan.
            </DialogDescription>
          </DialogHeader>
          
          {clientSecret ? (
            <Elements stripe={stripePromise} options={stripe_options}>
              <PaymentForm 
                onSuccess={handlePaymentSuccess} 
                onError={handlePaymentError}
                onCancel={() => setPaymentModalOpen(false)}
              />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}