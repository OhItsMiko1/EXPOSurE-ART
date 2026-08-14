import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/local-auth";
import { Artwork, User } from "@/lib/types";
import ArtworkCard from "./ArtworkCard";
import { Button } from "./button";
import { Loader2, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type RecommendationWithArtwork = {
  id: number;
  userId: number;
  artworkId: number;
  score: number;
  reason: string;
  createdAt: Date;
  viewed: boolean;
  artwork: Artwork & {
    artistName: string;
    categoryName: string;
  };
};

export default function RecommendedArtworks({ limit = 4 }: { limit?: number }) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: recommendations, isLoading, refetch } = useQuery<RecommendationWithArtwork[]>({
    queryKey: [user ? `/api/users/${user.id}/recommendations?limit=${limit}` : null],
    enabled: !!user,
  });

  const handleRefreshRecommendations = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      await apiRequest("GET", `/api/users/${user.id}/recommendations?refresh=true&limit=${limit}`);
      refetch();
    } catch (error) {
      console.error("Failed to refresh recommendations:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-full py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-gray-500">Finding art you'll love...</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-gray-500">No recommendations available yet. Explore more artwork to get personalized suggestions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Recommended For You</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshRecommendations}
          disabled={isRefreshing}
          className="flex items-center gap-1.5"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.id} className="group">
            <ArtworkCard artwork={rec.artwork} />
            <div className="mt-2 text-sm text-gray-500 italic group-hover:text-primary transition-colors">
              {rec.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}