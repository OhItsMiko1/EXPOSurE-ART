import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Palette, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Abstract artistic background with primary colors */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500 rounded-full blur-3xl transform -translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-1/3 h-1/3 bg-yellow-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="w-full max-w-md relative flex flex-col items-center text-center p-8">
        <div className="mb-8 flex flex-col items-center">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-full shadow-lg mb-4 glitter">
            <Palette className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 mb-2 glitter">404</h1>
          <h2 className="text-2xl font-medium text-gray-800 mb-4">Masterpiece Not Found</h2>
          <p className="text-gray-600 max-w-sm">
            The artwork you're looking for seems to have wandered off the canvas. Perhaps it's being reimagined somewhere else.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button asChild className="gap-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white hover:opacity-90 glitter">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Return to Gallery
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 btn-primary-hover">
            <Link href="/discover">
              Browse Collection
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
