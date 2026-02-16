import { SiDiscord } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'omnistream';

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              OmniStream
            </h3>
            <p className="text-sm text-muted-foreground">
              Share your videos and shorts with the world.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/shorts" className="hover:text-foreground transition-colors">
                  Shorts
                </a>
              </li>
              <li>
                <a href="/live" className="hover:text-foreground transition-colors">
                  Live
                </a>
              </li>
              <li>
                <a href="/upload" className="hover:text-foreground transition-colors">
                  Upload
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Community</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <SiDiscord className="h-5 w-5 text-[#5865F2]" />
                <div>
                  <div className="font-medium text-foreground">Discord Server</div>
                  <div>ommistream</div>
                </div>
              </div>
              <div className="text-sm">
                Contact: <span className="font-medium text-foreground">scottiscool</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1 flex-wrap">
            © {currentYear} OmniStream. Built with{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
