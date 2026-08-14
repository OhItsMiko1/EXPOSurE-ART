import { Link } from "wouter";
import { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Instagram, Dribbble, Globe } from "lucide-react";

interface ArtistCardProps {
  artist: User;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const initials = artist.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
  
  // Parse social links from JSON string or use empty object if undefined
  const socialLinks = artist.socialLinks ? JSON.parse(artist.socialLinks) : {};
  
  // Generate random gradient colors for demo purposes
  // In a real app, these would be saved with the artist profile
  const gradientColors = [
    'from-primary to-blue-400',
    'from-orange-500 to-yellow-500',
    'from-purple-500 to-primary',
    'from-green-500 to-blue-400'
  ];
  
  const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];
  
  // Generate artist specialties
  const specialties = artist.bio?.split(',') || [];
  const displaySpecialties = specialties.slice(0, 2).map(s => s.trim());
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className={`relative h-40 bg-gradient-to-r ${randomGradient}`}>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src={artist.profileImage} alt={artist.fullName} />
            <AvatarFallback className="text-xl bg-primary text-white">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="pt-16 pb-6 px-6 text-center">
        <h3 className="font-bold text-gray-800">{artist.fullName}</h3>
        <p className="text-sm text-gray-500 mb-3">
          {artist.bio?.substring(0, artist.bio.indexOf(',')) || 'Artist'} 
          {artist.location ? ` • ${artist.location}` : ''}
        </p>
        <div className="flex justify-center space-x-1">
          {displaySpecialties.map((specialty, index) => (
            <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700">
              {specialty}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
              <Instagram size={16} />
            </a>
          )}
          {socialLinks.dribbble && (
            <a href={socialLinks.dribbble} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
              <Dribbble size={16} />
            </a>
          )}
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
              <Globe size={16} />
            </a>
          )}
        </div>
        <Link href={`/artist/${artist.id}`} className="mt-4 inline-block text-primary text-sm font-medium">
          View Portfolio
        </Link>
      </div>
    </div>
  );
}
