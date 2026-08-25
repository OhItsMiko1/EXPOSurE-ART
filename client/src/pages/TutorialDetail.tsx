import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tutorial, TutorialStep, User } from "@/lib/types";
import { 
  Clock, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  Share2, 
  BookOpen,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/local-auth";
import { formatDistanceToNow } from "date-fns";

interface TutorialWithAuthor extends Tutorial {
  author?: User;
  categoryName?: string;
}

export default function TutorialDetail() {
  const [match, params] = useRoute<{ id: string }>("/tutorials/:id");
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(0);
  
  // Fetch tutorial details
  const { data: tutorial, isLoading: isLoadingTutorial } = useQuery<TutorialWithAuthor>({
    queryKey: [`/api/tutorials/${params?.id}`],
    enabled: !!params?.id,
  });

  const { data: relatedTutorials, isLoading: isLoadingRelated } = useQuery<Tutorial[]>({
    queryKey: [`/api/tutorials/category/${tutorial?.categoryId}`],
    enabled: !!tutorial?.categoryId,
  });

  if (isLoadingTutorial) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="w-full aspect-video rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div>
            <Skeleton className="h-32 w-full rounded-lg mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Tutorial Not Found</h1>
        <p className="text-gray-600 mb-6">The tutorial you're looking for doesn't exist or may have been removed.</p>
        <Button asChild>
          <Link href="/tutorials">Back to Tutorials</Link>
        </Button>
      </div>
    );
  }

  const steps = tutorial.steps || [];
  const currentStep = steps[activeStep] || null;
  
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

  return (
    <div className="bg-gray-50/70 min-h-screen pb-12">
      {/* Hero section with tutorial title and image */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/tutorials">
            <Button variant="ghost" size="sm" className="text-white mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tutorials
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{tutorial.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {tutorial.difficulty && (
                  <Badge className={`${getDifficultyColor(tutorial.difficulty)} text-xs`}>
                    {tutorial.difficulty}
                  </Badge>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {tutorial.durationMinutes ? `${tutorial.durationMinutes} min` : "Variable duration"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(tutorial.createdAt), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {tutorial.views} views
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {tutorial.likes || 0} likes
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Like
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="md:col-span-2">
            {/* Tutorial image or placeholder */}
            {tutorial.imageUrl ? (
              <img 
                src={tutorial.imageUrl} 
                alt={tutorial.title} 
                className="w-full rounded-lg mb-6 object-cover max-h-80"
              />
            ) : (
              <div className="w-full rounded-lg mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 aspect-video flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white opacity-75" />
              </div>
            )}
            
            {/* Tutorial description */}
            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this tutorial</h2>
              <div dangerouslySetInnerHTML={{ __html: tutorial.description }} />
            </div>
            
            {/* Tutorial steps */}
            {steps.length > 0 ? (
              <Tabs defaultValue="step-0" className="w-full">
                <TabsList className="mb-4 w-full overflow-x-auto whitespace-nowrap flex justify-start border-b border-gray-200 pb-0">
                  {steps.map((step, index) => (
                    <TabsTrigger 
                      key={step.id} 
                      value={`step-${index}`}
                      onClick={() => setActiveStep(index)}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-700 rounded-none border-b-2 border-transparent px-4 py-2"
                    >
                      Step {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {steps.map((step, index) => (
                  <TabsContent key={step.id} value={`step-${index}`} className="mt-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                      {step.imageUrl && (
                        <img 
                          src={step.imageUrl} 
                          alt={step.title} 
                          className="w-full rounded-lg mb-4 max-h-80 object-contain"
                        />
                      )}
                      {step.videoUrl && (
                        <div className="mb-4">
                          <video 
                            controls 
                            src={step.videoUrl}
                            className="w-full rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: step.content }}
                      />
                      
                      <div className="mt-6 flex justify-between">
                        <Button
                          variant="outline"
                          disabled={index === 0}
                          onClick={() => setActiveStep(index - 1)}
                        >
                          Previous Step
                        </Button>
                        <Button
                          disabled={index === steps.length - 1}
                          onClick={() => setActiveStep(index + 1)}
                        >
                          Next Step
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">Tutorial Content</h2>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: tutorial.content }}
                />
              </div>
            )}
            
            {/* Comments section placeholder */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Comments</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500 text-center py-4">
                  Comments are coming soon!
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Artist info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About the Artist</h3>
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={tutorial.author?.profileImage} alt={tutorial.author?.fullName || "Artist"} />
                    <AvatarFallback className="bg-purple-500 text-white">
                      {tutorial.author?.fullName?.substring(0, 2).toUpperCase() || "AR"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{tutorial.author?.fullName || "Unknown Artist"}</p>
                    <p className="text-sm text-gray-500">{tutorial.author?.isArtist ? "Professional Artist" : "Artist"}</p>
                  </div>
                </div>
                {tutorial.author?.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{tutorial.author.bio}</p>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/artist/${tutorial.authorId}`}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Category info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category</h3>
                <Link href={`/tutorials?category=${tutorial.categoryId}`}>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer">
                    {tutorial.categoryName || "Uncategorized"}
                  </Badge>
                </Link>
              </CardContent>
            </Card>
            
            {/* Related tutorials */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Related Tutorials</h3>
                {isLoadingRelated ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-md mr-3" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : relatedTutorials && relatedTutorials.length > 0 ? (
                  <div className="space-y-4">
                    {relatedTutorials
                      .filter(t => t.id !== tutorial.id)
                      .slice(0, 5)
                      .map(relatedTutorial => (
                        <Link 
                          key={relatedTutorial.id} 
                          href={`/tutorials/${relatedTutorial.id}`}
                          className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors"
                        >
                          <div className="h-12 w-12 rounded-md bg-gray-200 mr-3 overflow-hidden">
                            {relatedTutorial.imageUrl ? (
                              <img 
                                src={relatedTutorial.imageUrl} 
                                alt={relatedTutorial.title} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-indigo-400 to-purple-500">
                                <BookOpen className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium line-clamp-1">{relatedTutorial.title}</p>
                            <p className="text-xs text-gray-500">
                              {relatedTutorial.views} views
                              {relatedTutorial.difficulty && ` • ${relatedTutorial.difficulty}`}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </Link>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No related tutorials found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}