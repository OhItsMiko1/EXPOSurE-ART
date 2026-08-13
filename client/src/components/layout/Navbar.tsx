import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/local-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Menu, 
  Search, 
  Heart, 
  Bell, 
  User,
  Upload,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-3xl tracking-wider glitter">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">EXPOSurE</span>
                  <span className="text-primary">.ART</span>
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/discover" className={`${location === '/discover' ? 'border-red-500 text-neutral-800' : 'border-transparent text-neutral-500 hover:border-blue-500 hover:text-neutral-800'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                Discover
              </Link>
              <Link href="/category" className={`${location.startsWith('/category') ? 'border-blue-500 text-neutral-800' : 'border-transparent text-neutral-500 hover:border-yellow-500 hover:text-neutral-800'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                Categories
              </Link>
              <Link href="/artists" className={`${location === '/artists' ? 'border-yellow-500 text-neutral-800' : 'border-transparent text-neutral-500 hover:border-red-500 hover:text-neutral-800'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                Artists
              </Link>
              <Link href="/tutorials" className={`${location.startsWith('/tutorials') ? 'border-purple-500 text-neutral-800' : 'border-transparent text-neutral-500 hover:border-purple-500 hover:text-neutral-800'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                Tutorials
              </Link>
              <Link href="/commission" className={`${location === '/commission' ? 'border-blue-500 text-neutral-800' : 'border-transparent text-neutral-500 hover:border-yellow-500 hover:text-neutral-800'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                How It Works
              </Link>
              <Link href="/about" className={`${location === '/about' ? 'border-red-500 text-neutral-800' : 'border-transparent text-neutral-500 hover:border-red-500 hover:text-neutral-800'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                About Us
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search artwork or artists" 
                className="bg-gray-100 w-64 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-0 top-0 h-full rounded-full"
              >
                <Search className="h-4 w-4 text-gray-400" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
              <Heart className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
              <Bell className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImage} alt={user.username} />
                        <AvatarFallback className="bg-primary text-white">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user.isArtist && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/upload">
                            <Upload className="mr-2 h-4 w-4" />
                            <span>Upload Art</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={`/artist/${user.id}`}>Artist Page</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscription">Subscription</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user?.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {user.isArtist && (
                  <Button asChild>
                    <Link href="/upload">Upload Art</Link>
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="btn-primary-hover">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="artistic-border bg-white hover:bg-white/90 text-blue-600 hover:text-blue-700 font-medium glitter">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/discover" className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-red-500 hover:text-gray-700">
              Discover
            </Link>
            <Link href="/category" className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-blue-500 hover:text-gray-700">
              Categories
            </Link>
            <Link href="/artists" className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-yellow-500 hover:text-gray-700">
              Artists
            </Link>
            <Link href="/commission" className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-blue-500 hover:text-gray-700">
              How It Works
            </Link>
            <Link href="/about" className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-red-500 hover:text-gray-700">
              About Us
            </Link>
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback className="bg-primary text-white">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {user.isArtist && (
                    <>
                      <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                        Dashboard
                      </Link>
                      <Link href="/upload" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                        Upload Art
                      </Link>
                    </>
                  )}
                  <Link href={`/artist/${user.id}`} className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Artist Page
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link href="/subscription" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Subscription
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1 px-4">
                <Link href="/login" className="block text-center py-2 rounded-md text-base font-medium text-blue-600 hover:bg-gray-50">
                  Log In
                </Link>
                <Link href="/register" className="block text-center py-2 rounded-md text-base font-medium bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white hover:opacity-90 glitter">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}