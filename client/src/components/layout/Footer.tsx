import { Link } from "wouter";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-900 via-gray-800 to-red-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 glitter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">EXPOSurE</span>
              <span className="text-white">.ART</span>
            </h3>
            <p className="text-gray-300 text-sm">
              A marketplace connecting <span className="text-fuchsia-400 font-medium">real human artists</span> with art lovers and collectors worldwide.
            </p>
            <div className="mt-6 flex space-x-4">
              <span title="Coming soon" className="text-red-300/40 cursor-not-allowed">
                <Instagram size={20} />
              </span>
              <span title="Coming soon" className="text-blue-300/40 cursor-not-allowed">
                <Twitter size={20} />
              </span>
              <span title="Coming soon" className="text-blue-300/40 cursor-not-allowed">
                <Facebook size={20} />
              </span>
              <span title="Coming soon" className="text-red-300/40 cursor-not-allowed">
                <Youtube size={20} />
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-red-300">For Artists</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="text-gray-300 hover:text-red-300 transition-colors duration-300">Sell Your Art</Link></li>
              <li><Link href="/pricing" className="text-gray-300 hover:text-red-300 transition-colors duration-300">Pricing & Fees</Link></li>
              <li><Link href="/artist-resources" className="text-gray-300 hover:text-red-300 transition-colors duration-300">Artist Resources</Link></li>
              <li><Link href="/success-stories" className="text-gray-300 hover:text-red-300 transition-colors duration-300">Success Stories</Link></li>
              <li><Link href="/artist-faq" className="text-gray-300 hover:text-red-300 transition-colors duration-300">Artist FAQ</Link></li>
              <li><Link href="/live-events" className="text-gray-300 hover:text-red-300 transition-colors duration-300">Host Live Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-yellow-300">For Buyers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/discover" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300">Buy Original Art</Link></li>
              <li><Link href="/commission" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300">Commission Art</Link></li>
              <li><Link href="/gift-cards" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300">Gift Cards</Link></li>
              <li><Link href="/buyer-protection" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300">Buyer Protection</Link></li>
              <li><Link href="/buyer-faq" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300">Buyer FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-blue-300">About Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-blue-300 transition-colors duration-300">Our Story</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-blue-300 transition-colors duration-300">Careers</Link></li>
              <li><Link href="/press" className="text-gray-300 hover:text-blue-300 transition-colors duration-300">Press</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-blue-300 transition-colors duration-300">Contact Us</Link></li>
              <li><Link href="/trust-safety" className="text-gray-300 hover:text-blue-300 transition-colors duration-300">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="py-6 border-t border-gradient-to-r from-red-700 via-yellow-700 to-blue-700 text-sm text-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 glitter">
              &copy; {new Date().getFullYear()} <span className="text-blue-300">EXPOSurE</span>.<span className="text-red-300">ART</span>. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="hover:text-red-300 transition-colors duration-300">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-yellow-300 transition-colors duration-300">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-blue-300 transition-colors duration-300">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
