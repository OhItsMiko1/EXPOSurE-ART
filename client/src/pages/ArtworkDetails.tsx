import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Artwork, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingBag, 
  Heart, 
  Share, 
  MessageCircle, 
  Truck, 
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/lib/local-auth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

export default function ArtworkDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  
  const { data: artwork, isLoading: isLoadingArtwork } = useQuery<Artwork>({
    queryKey: [`/api/artworks/${id}`],
  });
  
  const { data: artist, isLoading: isLoadingArtist } = useQuery<User>({
    queryKey: [`/api/users/${artwork?.artistId}`],
    enabled: !!artwork?.artistId,
  });
  
  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${artwork?.title} has been added to your cart.`,
    });
  };
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${artwork?.title} has been ${isLiked ? "removed from" : "added to"} your favorites.`,
    });
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "The link to this artwork has been copied to your clipboard.",
    });
  };

  if (isLoadingArtwork || isLoadingArtist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-md" />
          
          <div className="space-y-6">
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="flex items-center space-x-4 py-4 border-y border-gray-200">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-12 w-full" />
              <div className="flex space-x-3">
                <Skeleton className="h-12 w-12" />
                <Skeleton className="h-12 w-12" />
                <Skeleton className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork || !artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Artwork Not Found</CardTitle>
            <CardDescription>The artwork you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/discover")}>Browse Other Artworks</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="grid md:grid-cols-2 gap-10">
        {/* Artwork Image */}
        <div className="rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-auto object-contain" 
          />
        </div>
        
        {/* Artwork Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{artwork.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
                {artwork.medium || "Unknown Medium"}
              </Badge>
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
                {artwork.isOriginal ? 'Original' : 
                  artwork.limitedEdition ? `Limited Edition (${artwork.editionCount})` : 
                  'Prints Available'}
              </Badge>
            </div>
            <p className="text-2xl font-semibold text-primary mt-4">${artwork.price.toFixed(2)}</p>
          </div>
          
          {/* Artist Info */}
          <div className="flex items-center space-x-4 py-4 border-y border-gray-200">
            <Avatar className="h-12 w-12">
              <AvatarImage src={artist.profileImage} alt={artist.fullName} />
              <AvatarFallback className="bg-primary text-white">
                {artist.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-800">by {artist.fullName}</p>
              <p className="text-sm text-gray-500">{artist.location || "Artist"}</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-primary"
              asChild
            >
              <a href={`/artist/${artist.id}`}>View Profile</a>
            </Button>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{artwork.description || "No description provided."}</p>
          </div>
          
          {/* Details */}
          <div className="space-y-3">
            {artwork.dimensions && (
              <div className="flex justify-between">
                <span className="text-gray-500">Dimensions</span>
                <span className="text-gray-800">{artwork.dimensions}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-800">{artwork.categoryName || "Uncategorized"}</span>
            </div>
            
            {artwork.medium && (
              <div className="flex justify-between">
                <span className="text-gray-500">Medium</span>
                <span className="text-gray-800">{artwork.medium}</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {artwork.forSale ? (
              <Button size="lg" onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contact Artist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact About: {artwork.title}</DialogTitle>
                    <DialogDescription>
                      This artwork is not currently for sale, but you can still contact the artist about it.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                      <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Message
                      </label>
                      <textarea 
                        id="message" 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="I'm interested in this artwork..." 
                      />
                    </div>
                  </form>
                  <DialogFooter>
                    <Button onClick={() => {
                      toast({
                        title: "Message sent",
                        description: `Your message has been sent to ${artist.fullName}.`,
                      });
                    }}>
                      Send Message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" onClick={handleLike}>
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share className="h-5 w-5" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Message About: {artwork.title}</DialogTitle>
                    <DialogDescription>
                      Send a message to the artist about this artwork.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                      <label htmlFor="question" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Your Question
                      </label>
                      <textarea 
                        id="question" 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="I have a question about this artwork..." 
                      />
                    </div>
                  </form>
                  <DialogFooter>
                    <Button onClick={() => {
                      toast({
                        title: "Message sent",
                        description: `Your question has been sent to ${artist.fullName}.`,
                      });
                    }}>
                      Send Question
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Shipping & Guarantee */}
          <div className="pt-6 mt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-600">Ships in 3-5 business days from {artist.location || 'the artist\'s location'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-600">Buyer Protection Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
