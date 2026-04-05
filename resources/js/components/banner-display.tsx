import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { type Banner } from '@/types';
import { cn } from '@/lib/utils';

interface BannerDisplayProps {
  banners: Banner[];
  onDismiss?: (bannerId: number) => void;
  onView?: (bannerId: number) => void;
  onClick?: (bannerId: number) => void;
}

export function BannerDisplay({ banners, onDismiss, onView, onClick }: Readonly<BannerDisplayProps>) {
  const [visibleBanners, setVisibleBanners] = useState<number[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Mark banners as viewed when they become visible
    banners.forEach((banner) => {
      if (!visibleBanners.includes(banner.id)) {
        onView?.(banner.id);
      }
    });
    setVisibleBanners(banners.map(b => b.id));
  }, [banners]);

  const handleDismiss = (bannerId: number) => {
    setDismissedBanners(prev => new Set(prev).add(bannerId));
    onDismiss?.(bannerId);
  };

  const handleActionClick = (banner: Banner) => {
    onClick?.(banner.id);
    if (banner.action_url) {
      globalThis.location.href = banner.action_url;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAlertClassName = (type: string): string => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200';
      default:
        return '';
    }
  };

  const activeBanners = banners.filter(banner => !dismissedBanners.has(banner.id));

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeBanners.map((banner) => (
        <div
          key={banner.id}
          className={cn(
            "relative rounded-lg border p-4",
            getAlertClassName(banner.type)
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(banner.type)}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="font-semibold text-sm">
                {banner.title}
              </div>
              <div
                className="text-sm leading-relaxed [&>p]:m-0"
                dangerouslySetInnerHTML={{ __html: banner.message }}
              />
              {banner.action_url && banner.action_text && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActionClick(banner)}
                  >
                    {banner.action_text}
                  </Button>
                </div>
              )}
            </div>
            {banner.is_dismissible && (
              <button
                onClick={() => handleDismiss(banner.id)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors -mt-1 -mr-1"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
