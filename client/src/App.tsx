import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/local-auth";

// Page imports
import Home from "@/pages/Home";
import Discover from "@/pages/Discover";
import ArtworkDetails from "@/pages/ArtworkDetails";
import ArtistProfile from "@/pages/ArtistProfile";
import ArtistDashboard from "@/pages/ArtistDashboard";
import UploadArtwork from "@/pages/UploadArtwork";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Commission from "@/pages/Commission";
import NotFound from "@/pages/not-found";
import Profile from "@/pages/Profile";
import Subscription from "@/pages/Subscription";
import AboutUs from "@/pages/AboutUs";
import Checkout from "@/pages/Checkout";
import Tutorials from "@/pages/Tutorials";
import TutorialDetail from "@/pages/TutorialDetail";
import CreateTutorial from "@/pages/CreateTutorial";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminDashboard from "./pages/AdminDashboard"; // Added import for AdminDashboard

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    // In production, we could send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error tracking service
      try {
        localStorage.setItem('lastError', JSON.stringify({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        // Handle localStorage errors silently
      }
    }

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-red-500 font-bold mb-2">Error: {this.state.error?.message}</h3>
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-500">View technical details</summary>
                  <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Debug component to show information about environment
function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false);
  const [info, setInfo] = useState({
    stripePublicKey: false,
    stripeSecretKey: false
  });

  useEffect(() => {
    // Check if keys are available (just checks existence, not values)
    setInfo({
      stripePublicKey: !!import.meta.env.VITE_STRIPE_PUBLIC_KEY,
      stripeSecretKey: false // Secret key should only be checked on the server
    });
  }, []);

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-200 text-gray-700 p-2 rounded-full z-50 shadow-md"
        title="Show debug info"
      >
        🛠️
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold">Debug Info</h4>
        <button onClick={() => setShowDebug(false)} className="text-gray-500">✕</button>
      </div>
      <ul className="text-sm">
        <li>
          Stripe Public Key: {info.stripePublicKey ? "✅ Present" : "❌ Missing"}
        </li>
        <li>
          React Version: {React.version}
        </li>
      </ul>
    </div>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/artwork/:id" component={ArtworkDetails} />
          <Route path="/artist/:id" component={ArtistProfile} />
          <Route path="/dashboard" component={ArtistDashboard} />
          <Route path="/upload" component={UploadArtwork} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/commission" component={Commission} />
          <Route path="/profile" component={Profile} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/about" component={AboutUs} />
          <Route path="/tutorials" component={Tutorials} />
          <Route path="/tutorials/create" component={CreateTutorial} />
          <Route path="/tutorials/:id" component={TutorialDetail} />
          <Route path="/admin" component={AdminDashboard} /> {/* Added admin route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <DebugInfo />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;