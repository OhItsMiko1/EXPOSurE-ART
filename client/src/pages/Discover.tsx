import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ArtworkCard from "@/components/ui/ArtworkCard";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Artwork, Category } from "@/lib/types";
import { Search } from "lucide-react";

export default function Discover() {
  // State for filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Fetch all artworks
  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: selectedCategoryId 
      ? ['/api/artworks', { categoryId: selectedCategoryId }] 
      : ['/api/artworks'],
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter and sort artworks
  useEffect(() => {
    if (!artworks) return;

    let result = [...artworks];

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(artwork => 
        artwork.title.toLowerCase().includes(query) || 
        artwork.description?.toLowerCase().includes(query) ||
        artwork.medium?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "priceHigh":
        result.sort((a, b) => b.price - a.price);
        break;
      case "priceLow":
        result.sort((a, b) => a.price - b.price);
        break;
      case "newest":
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "oldest":
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }

    setFilteredArtworks(result);
    setPage(1); // Reset to first page when filters change
  }, [artworks, searchQuery, sortBy, selectedCategoryId]);

  // Calculate pagination
  const totalItems = filteredArtworks?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedArtworks = filteredArtworks?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already applied via effect when searchQuery changes
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-400 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold font-poppins mb-4">Discover Authentic Artwork</h1>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Browse our collection of unique artworks created by <span className="text-fuchsia-700 font-medium">real human artists</span> from around the world
          </p>
          
          <form 
            onSubmit={handleSearch}
            className="flex max-w-md mx-auto bg-white rounded-full overflow-hidden shadow-lg"
          >
            <Input 
              type="text" 
              placeholder="Search for artworks or styles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filtering and Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <CategoryFilter 
            title="Browse Artwork" 
            onCategoryChange={setSelectedCategoryId} 
            selectedCategoryId={selectedCategoryId} 
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                <SelectItem value="priceLow">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-500">
            {totalItems === 0 && !isLoadingArtworks 
              ? "No results found" 
              : `Showing ${Math.min(totalItems, (page - 1) * itemsPerPage + 1)}-${Math.min(totalItems, page * itemsPerPage)} of ${totalItems} artworks`
            }
          </p>
        </div>

        {/* Artwork Grid */}
        {isLoadingArtworks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
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
        ) : filteredArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedArtworks.map(artwork => (
              <ArtworkCard 
                key={artwork.id} 
                artwork={artwork} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Artworks Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId(null);
                setSortBy("newest");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) < 3 || p === 1 || p === totalPages)
                .map((p, i, arr) => {
                  const isEllipsis = i > 0 && p > arr[i - 1] + 1;
                  return (
                    <div key={p}>
                      {isEllipsis && <span className="flex items-center justify-center w-9 h-9">...</span>}
                      <Button
                        variant={page === p ? "default" : "outline"}
                        onClick={() => setPage(p)}
                        className="w-9 h-9 p-0"
                      >
                        {p}
                      </Button>
                    </div>
                  );
                })}
              
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
