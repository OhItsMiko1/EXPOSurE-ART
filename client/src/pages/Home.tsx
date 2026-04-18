import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import ArtworkCard from "@/components/ui/ArtworkCard";
import ArtistCard from "@/components/ui/ArtistCard";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Artwork, User } from "@/lib/types";

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch featured artworks
  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: selectedCategoryId 
      ? ['/api/artworks', { categoryId: selectedCategoryId }] 
      : ['/api/artworks/featured'],
  });

  // Fetch featured artists
  const { data: artists, isLoading: isLoadingArtists } = useQuery<User[]>({
    queryKey: ['/api/users/featured-artists'],
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-100 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-poppins leading-tight">
              Discover and Buy Art from<br />
              <span className="text-fuchsia-700">Real Human Artists</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg">
              No AI-generated content. Just pure human creativity, passion, and talent.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/discover">Browse Artwork</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-fuchsia-700 text-fuchsia-700 hover:bg-fuchsia-50" asChild>
                <Link href="/register">Become an Artist</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Category Filter */}
      <CategoryFilter 
        title="Featured Artwork" 
        onCategoryChange={setSelectedCategoryId} 
        selectedCategoryId={selectedCategoryId} 
      />

      {/* Artwork Gallery */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingArtworks ? (
              // Loading skeletons
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden bg-white shadow-md">
                  <Skeleton className="w-full h-80" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              artworks?.map(artwork => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              className="border-primary text-black hover:bg-primary hover:text-white"
              asChild
            >
              <Link href="/discover">Load More Artwork</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">Featured Artists</h2>
            <p className="mt-2 text-gray-500">Discover talented artists from around the world</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingArtists ? (
              // Loading skeletons
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="pt-16 pb-6 px-6 text-center">
                    <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                    <Skeleton className="h-4 w-3/4 mx-auto mb-4" />
                    <div className="flex justify-center space-x-1">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="mt-4 flex justify-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-28 mx-auto mt-4" />
                  </div>
                </div>
              ))
            ) : (
              artists?.map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Link href="/artists" className="inline-flex items-center text-primary font-medium">
              Discover more artists
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">How It Works</h2>
            <p className="mt-2 text-gray-500 max-w-2xl mx-auto">Our platform connects real human artists with art lovers and collectors in a simple and secure way</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">For Artists</h3>
              <p className="text-gray-500">Create your portfolio, upload your artwork, and set your prices. Get discovered by art lovers worldwide.</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Free portfolio creation
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Receive commission requests
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Secure payments
                </li>
              </ul>
              <Link href="/register" className="mt-6 inline-block text-primary font-medium text-sm">
                Learn more about selling
              </Link>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-orange-500 bg-opacity-10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">For Buyers</h3>
              <p className="text-gray-500">Discover unique artwork from real human artists. Purchase original pieces or commission custom work.</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Authentic human-created art
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Direct artist communication
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Buyer protection guarantee
                </li>
              </ul>
              <Link href="/discover" className="mt-6 inline-block text-orange-500 font-medium text-sm">
                Learn more about buying
              </Link>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-400 bg-opacity-10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Commissions</h3>
              <p className="text-gray-500">Request custom artwork created specifically for you. Work directly with artists to bring your vision to life.</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Custom project briefs
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Milestone payments
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  Revision options
                </li>
              </ul>
              <Link href="/commission" className="mt-6 inline-block text-blue-400 font-medium text-sm">
                Learn about commissions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Commission CTA */}
      <section className="bg-gradient-to-r from-primary to-blue-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:max-w-xl">
              <h2 className="text-3xl font-bold font-poppins">Need Custom Artwork?</h2>
              <p className="mt-3 text-lg">
                Commission a piece that's uniquely yours. Our artists create custom artwork based on your vision.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
                  <Link href="/commission">Request a Commission</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/commission">How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:ml-8 hidden md:block">
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="relative h-32 w-32 rounded-md overflow-hidden transform rotate-3">
                  <div className="h-full w-full bg-blue-300/50" />
                </div>
                <div className="relative h-32 w-32 rounded-md overflow-hidden transform -rotate-2">
                  <div className="h-full w-full bg-blue-300/50" />
                </div>
                <div className="relative h-32 w-32 rounded-md overflow-hidden transform rotate-1">
                  <div className="h-full w-full bg-blue-300/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">What Our Community Says</h2>
            <p className="mt-2 text-gray-500">Hear from artists and art lovers who use our platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-100 rounded-lg p-6 relative">
              <div className="absolute top-6 right-6 text-4xl text-primary opacity-20">"</div>
              <p className="text-gray-800 mb-6 relative z-10">
                EXPOSurE.ART has completely transformed how I sell my paintings. I've connected with collectors from around the world and have been able to make a living doing what I love.
              </p>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300"></div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">David Chen</h4>
                  <p className="text-sm text-gray-500">Oil Painter, Toronto</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-6 relative">
              <div className="absolute top-6 right-6 text-4xl text-primary opacity-20">"</div>
              <p className="text-gray-800 mb-6 relative z-10">
                I commissioned a piece for my wife's birthday through EXPOSurE.ART. The artist was incredible to work with, and the final piece exceeded our expectations. It's now the centerpiece of our living room.
              </p>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300"></div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">Linda Morgan</h4>
                  <p className="text-sm text-gray-500">Art Collector, Chicago</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-6 relative">
              <div className="absolute top-6 right-6 text-4xl text-primary opacity-20">"</div>
              <p className="text-gray-800 mb-6 relative z-10">
                As an illustrator, finding clients used to be a constant struggle. With EXPOSurE.ART, I've built a consistent client base and have been able to focus more on creating and less on marketing myself.
              </p>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300"></div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">Sofia Loren</h4>
                  <p className="text-sm text-gray-500">Illustrator, Berlin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
