import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ArtworkCardProps {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    if (!isLiked) {
      toast({
        title: "Added to favorites",
        description: `${artwork.title} has been added to your favorites.`,
      });
    } else {
      toast({
        title: "Removed from favorites",
        description: `${artwork.title} has been removed from your favorites.`,
      });
    }
  };
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(`/checkout/artwork/${artwork.id}`);
  };
  
  return (
    <div className="art-card rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/artwork/${artwork.id}`} className="block relative group">
        <img 
          src={artwork.imageUrl} 
          alt={artwork.title} 
          className="w-full h-auto object-cover aspect-[3/4]"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <Button 
            onClick={handleLike}
            className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 mx-1"
            size="icon"
            variant="outline"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </Button>
          <Button
            onClick={handleBuyNow}
            className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 mx-1"
            size="icon"
            variant="outline"
          >
            <ShoppingBag className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-800">{artwork.title}</h3>
            <p className="text-sm text-gray-500">by {artwork.artistName}</p>
          </div>
          <span className="text-primary font-medium">${artwork.price.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
            {artwork.medium || artwork.categoryName}
          </Badge>
          <span className="ml-2">{artwork.isOriginal ? 'Original' : 
            artwork.limitedEdition ? `Limited Edition (${artwork.editionCount})` : 
            'Prints Available'}</span>
        </div>
      </div>
    </div>
  );
}
