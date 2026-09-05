import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AboutUs() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
          About EXPOSurE.ART
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A marketplace exclusively for human-created artworks, supporting and celebrating non-AI artists.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-12 border-none shadow-lg bg-white/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-fuchsia-600">Our Story</h2>
            <p className="text-lg mb-6 leading-relaxed">
              EXPOSurE.ART was born from a deep appreciation for authentic, human-made creativity. Founded by artists, for artists, our platform emerged from the frustration of seeing traditional and digital art drowned out by mass-produced content and impersonal algorithms. We saw a gap in the market—a space where true artists could connect with passionate collectors and showcase their work without compromise. EXPOSurE.ART is a haven where oil painters, digital illustrators, sculptors, and all creative minds can share, sell, and celebrate their art in a supportive and curated environment.
            </p>
            
            <div className="my-10 relative">
              <Separator className="absolute inset-0 m-auto h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-lg font-medium text-fuchsia-600">Our Mission</span>
              </div>
            </div>
            
            <p className="text-lg mb-6 leading-relaxed">
              At EXPOSurE.ART, our mission is to empower artists by giving them a trusted platform to showcase and sell their work to a global audience. We aim to build a vibrant, authentic art community where creativity thrives, and originality is celebrated. Our goal is to ensure that every artist—regardless of medium or background—has the opportunity to turn passion into purpose and make a lasting impact through their art.
            </p>
            
            <div className="my-10 relative">
              <Separator className="absolute inset-0 m-auto h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-lg font-medium text-fuchsia-600">Our Values</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-fuchsia-600 font-bold mr-2">•</span>
                <span>Authenticity – We champion original, human-made art and celebrate the creative spirit behind each piece.</span>
              </li>
              <li className="flex items-start">
                <span className="text-fuchsia-600 font-bold mr-2">•</span>
                <span>Empowerment – We equip artists with the tools, visibility, and support they need to succeed on their own terms.</span>
              </li>
              <li className="flex items-start">
                <span className="text-fuchsia-600 font-bold mr-2">•</span>
                <span>Community – We foster a culture of connection, collaboration, and mutual support among artists and collectors alike.</span>
              </li>
            </ul>
            
            <div className="my-10 relative">
              <Separator className="absolute inset-0 m-auto h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-lg font-medium text-fuchsia-600">What Makes Us Different</span>
              </div>
            </div>
            
            <p className="text-lg mb-6 leading-relaxed">
              Unlike generic marketplaces, EXPOSurE.ART is exclusively built for real artists—not AI generators, mass producers, or dropshippers. We focus on quality over quantity, offering a curated space where artists' voices are heard and their work is valued. With tools tailored for visual storytellers, transparent commission structures, and a human-first approach, we're redefining how art is shared and sold online.
            </p>
            
            <div className="my-10 relative">
              <Separator className="absolute inset-0 m-auto h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-lg font-medium text-fuchsia-600">Our Team</span>
              </div>
            </div>
            
            <p className="text-lg mb-6 leading-relaxed">
              EXPOSurE.ART was founded by Mikol Anthony, an artist who deeply understands the challenges of the modern art world. Together with a team of passionate creators and curators, he established a platform that puts real art and real artists first. Combining decades of experience in the arts, e-commerce, and community-building, we are committed to supporting the vision of a thriving, human-powered art platform.
            </p>
            
            <div className="my-10 relative">
              <Separator className="absolute inset-0 m-auto h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-lg font-medium text-fuchsia-600">Community Focus</span>
              </div>
            </div>
            
            <p className="text-lg leading-relaxed">
              We believe in nurturing the artist beyond the sale. EXPOSurE.ART hosts regular virtual showcases, collaborative projects, mentorship programs, and resource hubs that help artists grow their brand, refine their craft, and connect with a wider audience. Whether it's offering feedback, spotlighting emerging talent, or providing educational content, we are committed to building a sustainable ecosystem where artists not only survive—but thrive.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}