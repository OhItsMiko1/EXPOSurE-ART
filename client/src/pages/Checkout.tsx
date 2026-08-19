import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/lib/local-auth";
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Artwork } from '@/lib/types';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment form component
const PaymentForm = ({ returnPath }: { returnPath: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const [, navigate] = useLocation();

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
          return_url: window.location.origin + returnPath,
        }
      });
      
      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
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
          onClick={() => navigate(returnPath)}
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
            'Pay now'
          )}
        </Button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const { id: artworkId } = useParams<{ id?: string }>();
  const [clientSecret, setClientSecret] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const returnPath = artworkId ? `/artwork/${artworkId}` : '/subscription';

  const { data: artwork } = useQuery<Artwork>({
    queryKey: [`/api/artworks/${artworkId}`],
    enabled: !!artworkId,
  });

  useEffect(() => {
    // Check authentication
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your purchase",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = artworkId
          ? await apiRequest('POST', `/api/artworks/${artworkId}/create-payment-intent`)
          : await apiRequest('POST', '/api/create-payment-intent', {
              amount: 1000 // $10.00 for premium subscription
            });

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Payment setup failed',
          description: 'There was an error setting up the payment process. Please try again later.',
          variant: 'destructive'
        });
      }
    };

    createPaymentIntent();
  }, [user, navigate, toast, artworkId]);
  
  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Setting up your payment...</p>
        </div>
      </div>
    );
  }
  
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#FF1493', // Fuchsia
      colorBackground: '#ffffff',
      colorText: '#333333', 
      colorDanger: '#FF0000',
      fontFamily: 'Poppins, system-ui, sans-serif',
      borderRadius: '8px',
    },
  };
  
  const options = {
    clientSecret,
    appearance,
  };
  
  return (
    <div className="container max-w-md py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-transparent bg-clip-text">Complete your payment</CardTitle>
          <CardDescription>
            {artworkId
              ? `Secure payment for "${artwork?.title ?? 'this artwork'}"`
              : 'Secure payment for your EXPOSurE.ART Premium subscription'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm returnPath={returnPath} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}