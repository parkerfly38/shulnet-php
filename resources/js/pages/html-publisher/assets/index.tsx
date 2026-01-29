import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type BreadcrumbItem } from '@/types';
import { Copy, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface HtmlAsset {
  id: number;
  name: string;
  filename: string;
  url: string;
  storage_provider: 'local' | 'cloudflare' | 's3' | 'azure';
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
}

interface Props {
  assets: HtmlAsset[];
}

export default function HtmlAssetsIndex({ assets }: Readonly<Props>) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data, setData, post, processing, reset } = useForm({
    file: null as File | null,
    alt_text: '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'HTML Publisher', href: '/admin/html-pages' },
    { title: 'Assets', href: '/admin/html-assets' },
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.alt_text) {
      formData.append('alt_text', data.alt_text);
    }

    router.post('/admin/html-assets', formData, {
      forceFormData: true,
      onSuccess: () => {
        setShowUploadDialog(false);
        reset();
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      router.delete(`/admin/html-assets/${id}`);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="HTML Assets" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Asset Library</h1>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        </div>

        {assets.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 mb-4">No assets uploaded yet</p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Asset
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {asset.mime_type?.startsWith('image/') ? (
                    <img
                      src={asset.url}
                      alt={asset.alt_text || asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl text-gray-400">📄</div>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <div className="text-sm font-medium truncate" title={asset.name}>
                    {asset.name}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>{formatFileSize(asset.file_size)}</div>
                    {asset.width && asset.height && (
                      <div>{asset.width} × {asset.height}</div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                        {asset.storage_provider}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCopyUrl(asset.url)}
                    >
                      <Copy className="h-3 w-3" />
                      {copiedUrl === asset.url ? 'Copied!' : 'Copy URL'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Asset</DialogTitle>
            <DialogDescription>
              Upload images and files for use in your HTML pages
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setData('file', e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Maximum size: 10MB</p>
            </div>

            <div>
              <Label htmlFor="alt_text">Alt Text (for images)</Label>
              <Input
                id="alt_text"
                value={data.alt_text}
                onChange={(e) => setData('alt_text', e.target.value)}
                placeholder="Description for accessibility"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
