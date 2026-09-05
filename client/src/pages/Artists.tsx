import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ArtistCard from "@/components/ui/ArtistCard";
import { User } from "@/lib/types";
import { Search } from "lucide-react";

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: artists, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/artists'],
  });

  const filteredArtists = (artists ?? []).filter(artist => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      artist.fullName.toLowerCase().includes(query) ||
      artist.bio?.toLowerCase().includes(query) ||
      artist.location?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-400 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold font-poppins mb-4">Meet the Artists</h1>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Browse the <span className="text-fuchsia-700 font-medium">real human artists</span> creating and selling on EXPOSurE.ART
          </p>

          <div className="flex max-w-md mx-auto bg-white rounded-full overflow-hidden shadow-lg">
            <Input
              type="text"
              placeholder="Search artists by name, style, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="button" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Artist Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="pt-16 pb-6 px-6 text-center">
                  <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto mb-4" />
                  <div className="flex justify-center space-x-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArtists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArtists.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Artists Found</h3>
            <p className="text-gray-600 mb-4">Try a different search.</p>
            <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  );
}
