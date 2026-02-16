import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Video, Film, Radio, BarChart3, Image, X } from 'lucide-react';

export default function FloatingActionButton() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return null;
  }

  const handleAction = (action: 'video' | 'short' | 'live' | 'polls' | 'post') => {
    setIsOpen(false);
    
    if (action === 'video') {
      navigate({ to: '/upload', search: { mediaType: 'video' } });
    } else if (action === 'short') {
      navigate({ to: '/upload', search: { mediaType: 'short' } });
    } else if (action === 'live') {
      navigate({ to: '/live', search: { startLive: '1' } });
    } else if (action === 'polls') {
      navigate({ to: '/polls' });
    } else if (action === 'post') {
      navigate({ to: '/posts' });
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <Card className="shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CardContent className="p-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleAction('video')}
              >
                <Video className="h-5 w-5" />
                <span>Upload Video</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleAction('short')}
              >
                <Film className="h-5 w-5" />
                <span>Upload Short</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleAction('live')}
              >
                <Radio className="h-5 w-5 text-red-500" />
                <span>Go Live</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleAction('polls')}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Polls</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleAction('post')}
              >
                <Image className="h-5 w-5" />
                <span>Post</span>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
}
