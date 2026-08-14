import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tutorial, Category } from "@/lib/types";
import { Search, BookOpen, Users, Clock, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/local-auth";

export default function Tutorials() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Fetch all tutorials
  const { data: tutorials, isLoading: isLoadingTutorials } = useQuery<Tutorial[]>({
    queryKey: ['/api/tutorials'],
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter tutorials
  useEffect(() => {
    if (!tutorials) return;

    let result = [...tutorials];

    // Filter by category if selected (0 means "All Categories")
    if (selectedCategoryId !== null && selectedCategoryId !== 0) {
      result = result.filter(tutorial => tutorial.categoryId === selectedCategoryId);
    }

    // Filter by difficulty if selected
    if (difficulty && difficulty !== 'all') {
      result = result.filter(tutorial => tutorial.difficulty === difficulty);
    }

    // Apply search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tutorial => 
        tutorial.title.toLowerCase().includes(query) || 
        tutorial.description.toLowerCase().includes(query) ||
        tutorial.content.toLowerCase().includes(query)
      );
    }

    setFilteredTutorials(result);
    setPage(1); // Reset to first page when filters change
  }, [tutorials, searchQuery, selectedCategoryId, difficulty]);

  // Calculate pagination
  const totalItems = filteredTutorials?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTutorials = filteredTutorials?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getDifficultyColor = (difficulty: string = "beginner") => {
    switch(difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already applied via effect when searchQuery changes
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold font-poppins mb-4">Learn Art Techniques From <span className="text-fuchsia-300 font-medium">Real Human Artists</span></h1>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Explore step-by-step tutorials created by professional artists to help you develop your skills
          </p>
          
          <form 
            onSubmit={handleSearch}
            className="flex max-w-md mx-auto bg-white rounded-full overflow-hidden shadow-lg"
          >
            <Input 
              type="text" 
              placeholder="Search for tutorials..." 
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
        {/* Add Tutorial Button for Artists */}
        {user?.isArtist && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Share Your Expertise</h3>
                <p className="text-gray-600 max-w-2xl">
                  As an artist, you can create tutorials to help others learn your techniques and grow the community.
                </p>
              </div>
              <Button asChild className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
                <Link href="/tutorials/create">Create Tutorial</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Filtering */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Explore Tutorials</h2>
            <p className="text-gray-600">Learn techniques from artists around the world</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedCategoryId?.toString() || ""} onValueChange={(val) => setSelectedCategoryId(val ? parseInt(val) : null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Categories</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={difficulty || ""} onValueChange={(val) => setDifficulty(val || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-500">
            {totalItems === 0 && !isLoadingTutorials 
              ? "No tutorials found" 
              : `Showing ${Math.min(totalItems, (page - 1) * itemsPerPage + 1)}-${Math.min(totalItems, page * itemsPerPage)} of ${totalItems} tutorials`
            }
          </p>
        </div>

        {/* Tutorials Grid */}
        {isLoadingTutorials ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-white shadow-md">
                <Skeleton className="w-full aspect-video" />
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
        ) : filteredTutorials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedTutorials.map(tutorial => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    {tutorial.imageUrl ? (
                      <img 
                        src={tutorial.imageUrl} 
                        alt={tutorial.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                    )}
                    {tutorial.difficulty && (
                      <Badge className={`absolute top-2 right-2 ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{tutorial.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      {tutorial.durationMinutes && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {tutorial.durationMinutes} min
                        </span>
                      )}
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {tutorial.views} views
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-gray-500">
                        By {tutorial.authorName || "Unknown Artist"}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tutorials Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId(null);
                setDifficulty(null);
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