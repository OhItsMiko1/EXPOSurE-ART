import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, Artwork } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ArtworkCard from "@/components/ui/ArtworkCard";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Instagram, Twitter, Facebook, Globe, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  const { data: artist, isLoading: isLoadingArtist } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });
  
  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: selectedCategoryId 
      ? ['/api/artworks', { artistId: id, categoryId: selectedCategoryId }] 
      : ['/api/artworks', { artistId: id }],
    enabled: !!id,
  });
  
  // Parse social links from JSON string or use empty object if undefined
  const socialLinks = artist?.socialLinks ? JSON.parse(artist.socialLinks) : {};
  
  const handleContactRequest = () => {
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${artist?.fullName}.`,
    });
  };
  
  const handleCommissionRequest = () => {
    toast({
      title: "Commission Request Sent",
      description: `Your commission request has been sent to ${artist?.fullName}.`,
    });
  };
  
  if (isLoadingArtist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex space-x-2 mb-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex space-x-2 mb-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="w-full space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <Skeleton className="h-10 w-40 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden bg-white shadow-md">
                  <Skeleton className="w-full aspect-[3/4]" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Artist Not Found</h1>
          <p className="text-gray-600 mb-4">The artist you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <a href="/discover">Browse Artworks</a>
          </Button>
        </div>
      </div>
    );
  }
  
  // Generate artist specialties
  const specialties = artist.bio?.split(',') || [];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Artist Info Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={artist.profileImage} alt={artist.fullName} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {artist.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{artist.fullName}</h1>
              <p className="text-gray-500 mb-4">{artist.location || "Artist"}</p>
              
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700">
                    {specialty.trim()}
                  </Badge>
                ))}
              </div>
              
              <p className="text-gray-600 text-center mb-4">{artist.bio}</p>
              
              <div className="flex space-x-3 mb-6">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                    <Instagram size={20} />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                    <Twitter size={20} />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                    <Facebook size={20} />
                  </a>
                )}
                {socialLinks.website && (
                  <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                    <Globe size={20} />
                  </a>
                )}
              </div>
              
              {/* Don't show contact/commission buttons if viewing own profile */}
              {(!currentUser || currentUser.id !== parseInt(id)) && (
                <div className="w-full space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Mail className="mr-2 h-5 w-5" />
                        Contact Artist
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact {artist.fullName}</DialogTitle>
                        <DialogDescription>
                          Send a message to the artist. They will respond to the email address associated with your account.
                        </DialogDescription>
                      </DialogHeader>
                      <form className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <label htmlFor="subject" className="text-sm font-medium">
                            Subject
                          </label>
                          <input 
                            id="subject" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Subject of your message" 
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <label htmlFor="message" className="text-sm font-medium">
                            Message
                          </label>
                          <textarea 
                            id="message" 
                            rows={5}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Write your message here..." 
                          />
                        </div>
                      </form>
                      <DialogFooter>
                        <Button onClick={handleContactRequest}>Send Message</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Request Commission
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Commission {artist.fullName}</DialogTitle>
                        <DialogDescription>
                          Request a custom artwork from this artist. Describe what you're looking for.
                        </DialogDescription>
                      </DialogHeader>
                      <form className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <label htmlFor="commissionTitle" className="text-sm font-medium">
                            Project Title
                          </label>
                          <input 
                            id="commissionTitle" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Give your commission a title" 
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <label htmlFor="commissionDesc" className="text-sm font-medium">
                            Description
                          </label>
                          <textarea 
                            id="commissionDesc" 
                            rows={5}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe what you're looking for in detail..." 
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <label htmlFor="budget" className="text-sm font-medium">
                            Budget (USD)
                          </label>
                          <input 
                            id="budget" 
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Your budget for this commission" 
                          />
                        </div>
                      </form>
                      <DialogFooter>
                        <Button onClick={handleCommissionRequest}>
                          Submit Commission Request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Artist Portfolio */}
        <div className="lg:w-2/3">
          <Tabs defaultValue="portfolio">
            <TabsList className="mb-6">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio">
              <CategoryFilter 
                title="Artworks" 
                onCategoryChange={setSelectedCategoryId} 
                selectedCategoryId={selectedCategoryId} 
              />
              
              {isLoadingArtworks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-white shadow-md">
                      <Skeleton className="w-full aspect-[3/4]" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : artworks && artworks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  {artworks.map(artwork => (
                    <ArtworkCard 
                      key={artwork.id} 
                      artwork={{
                        ...artwork,
                        artistName: artist.fullName
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Artworks Found</h3>
                  <p className="text-gray-600">
                    {currentUser && currentUser.id === parseInt(id) 
                      ? "You haven't uploaded any artworks yet. Start building your portfolio!" 
                      : "This artist hasn't uploaded any artworks yet."}
                  </p>
                  
                  {currentUser && currentUser.id === parseInt(id) && (
                    <Button className="mt-4" asChild>
                      <a href="/upload">Upload Your First Artwork</a>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="about">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About {artist.fullName}</h2>
                
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-6">{artist.bio || "No bio provided."}</p>
                  
                  {specialties.length > 0 && (
                    <>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Specialties</h3>
                      <ul className="list-disc pl-5 mb-6">
                        {specialties.map((specialty, index) => (
                          <li key={index} className="text-gray-600">{specialty.trim()}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Location</h3>
                  <p className="text-gray-600 mb-6">{artist.location || "Not specified"}</p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Member Since</h3>
                  <p className="text-gray-600">
                    {artist.createdAt
                      ? new Date(artist.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
