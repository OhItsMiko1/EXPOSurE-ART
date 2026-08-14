import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/local-auth";
import { commissionFormSchema, CommissionFormValues, User } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ArtistCard from "@/components/ui/ArtistCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function Commission() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  
  // Fetch artists
  const { data: artists, isLoading: isLoadingArtists } = useQuery<User[]>({
    queryKey: ['/api/users/artists'],
  });

  const form = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: undefined,
      status: "pending",
      // Set buyer ID if user is logged in
      buyerId: user ? user.id : undefined,
      // Set artist ID if one is selected
      artistId: selectedArtistId ? parseInt(selectedArtistId) : undefined,
    },
  });

  // Update artist ID in form when selected artist changes
  useState(() => {
    if (selectedArtistId) {
      form.setValue("artistId", parseInt(selectedArtistId));
    }
  });

  // Create commission mutation
  const commissionMutation = useMutation({
    mutationFn: async (data: CommissionFormValues) => {
      const response = await apiRequest("POST", "/api/commissions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Commission Request Sent",
        description: "Your commission request has been sent to the artist.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/commissions'] });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send commission request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CommissionFormValues) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to request a commission.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (!selectedArtistId) {
      toast({
        title: "Artist Required",
        description: "Please select an artist for your commission request.",
        variant: "destructive",
      });
      return;
    }
    
    // Set the artist and buyer IDs
    const data = {
      ...values,
      artistId: parseInt(selectedArtistId),
      buyerId: user.id,
    };
    
    commissionMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-400 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold font-poppins mb-4">Request a Custom Artwork</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Commission a unique piece created just for you by a real human artist
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs defaultValue="how-it-works">
          <TabsList className="w-full mb-8">
            <TabsTrigger value="how-it-works" className="flex-1">How It Works</TabsTrigger>
            <TabsTrigger value="request-commission" className="flex-1">Request Commission</TabsTrigger>
          </TabsList>
          
          {/* How It Works Tab */}
          <TabsContent value="how-it-works">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                  <span className="font-bold text-primary text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Choose an Artist</h3>
                <p className="text-gray-600 mb-4">
                  Browse through our talented artists and select someone whose style matches your vision.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">View artist portfolios to see their work</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Select an artist based on their style and expertise</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-12 w-12 rounded-full bg-orange-500 bg-opacity-10 flex items-center justify-center mb-4">
                  <span className="font-bold text-orange-500 text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Describe Your Vision</h3>
                <p className="text-gray-600 mb-4">
                  Fill out the commission form with details about your project, including budget and timeline.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Provide a clear description of what you want</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Set your budget and preferred timeline</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Include reference images if available</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-12 w-12 rounded-full bg-blue-400 bg-opacity-10 flex items-center justify-center mb-4">
                  <span className="font-bold text-blue-400 text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Collaborate & Receive</h3>
                <p className="text-gray-600 mb-4">
                  Work directly with the artist through the creative process and receive your custom artwork.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Review and approve concepts and sketches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Request revisions during the process</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Receive your one-of-a-kind artwork</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <Button size="lg" onClick={() => document.querySelector('[data-value="request-commission"]')?.click()}>
                Start Your Commission Request
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            {/* FAQ Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">How much does a commission cost?</h3>
                  <p className="text-gray-600">
                    Commission prices vary depending on the artist, complexity, size, and medium. You can set your budget in the commission request, and the artist will let you know if it's feasible.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">How long does a commission take?</h3>
                  <p className="text-gray-600">
                    Timeframes vary based on the artist's schedule and the complexity of the project. Simple works might take a week, while complex pieces could take several months.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Can I request revisions?</h3>
                  <p className="text-gray-600">
                    Yes! Most artists include a certain number of revision rounds as part of their commission process. The exact number will be discussed during the initial agreement.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">How do payments work?</h3>
                  <p className="text-gray-600">
                    Typically, commissions require a non-refundable deposit upfront (usually 30-50%), with the remainder due upon completion. All payments are securely processed through our platform.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Request Commission Tab */}
          <TabsContent value="request-commission">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Commission Request Form</h2>
                  
                  {!user ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">Login Required</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            You need to be logged in to submit a commission request.{" "}
                            <Button variant="link" className="p-0 h-auto text-primary" asChild>
                              <a href="/login">Log in</a>
                            </Button>{" "}
                            or{" "}
                            <Button variant="link" className="p-0 h-auto text-primary" asChild>
                              <a href="/register">create an account</a>
                            </Button>.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : !selectedArtistId ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">Artist Selection Required</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            Please select an artist from the list on the right before submitting your commission request.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Family Portrait, Book Cover Illustration"
                                disabled={commissionMutation.isPending || !user}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Give your commission a clear, descriptive title
                            </FormDescription>
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
                                placeholder="Describe what you're looking for in detail. Include information about style, colors, subject matter, size, medium, etc."
                                className="min-h-[150px]"
                                disabled={commissionMutation.isPending || !user}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Be as specific as possible to help the artist understand your vision
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget (USD)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="e.g., 250"
                                  disabled={commissionMutation.isPending || !user}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Indicate your budget for this commission
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                defaultValue={field.value} 
                                onValueChange={field.onChange}
                                disabled
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Your commission will start with "Pending" status
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="your-email@example.com"
                                  disabled={commissionMutation.isPending || !user}
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Additional contact email if different from your account
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  placeholder="+1 (555) 123-4567"
                                  disabled={commissionMutation.isPending || !user}
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Alternative way for the artist to contact you
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={commissionMutation.isPending || !user || !selectedArtistId}
                      >
                        {commissionMutation.isPending ? "Submitting..." : "Submit Commission Request"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
              
              {/* Artist Selection */}
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Select an Artist</h3>
                  
                  {isLoadingArtists ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 h-36 rounded-lg"></div>
                      ))}
                    </div>
                  ) : artists && artists.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {artists.filter(artist => artist.isArtist).map(artist => (
                        <div 
                          key={artist.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedArtistId === artist.id.toString() 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedArtistId(artist.id.toString())}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <img 
                                src={artist.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.fullName)}&background=random`} 
                                alt={artist.fullName}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{artist.fullName}</h4>
                              <p className="text-sm text-gray-500">
                                {artist.bio?.split(',')[0] || 'Artist'} {artist.location ? `• ${artist.location}` : ''}
                              </p>
                            </div>
                          </div>
                          
                          {selectedArtistId === artist.id.toString() && (
                            <div className="mt-3 pt-3 border-t border-primary/20">
                              <Button variant="outline" size="sm" className="w-full" asChild>
                                <a href={`/artist/${artist.id}`} target="_blank" rel="noopener noreferrer">
                                  View Portfolio
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No artists available at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
