import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichTextEditor from '@/components/rich-text-editor';
import { type BreadcrumbItem } from '@/types';

interface HtmlTemplate {
  id: number;
  name: string;
}

interface HtmlPageFormData {
  title: string;
  slug: string;
  content: string;
  header: string;
  footer: string;
  navigation: string;
  meta_description: string;
  meta_keywords: string;
  template_id: number | null;
  status: 'draft' | 'published' | 'archived';
  sort_order: number;
  show_in_nav: boolean;
}

interface Props {
  templates: HtmlTemplate[];
}

export default function HtmlPageCreate({ templates }: Readonly<Props>) {
  const { data, setData, post, processing, errors } = useForm<HtmlPageFormData>({
    title: '',
    slug: '',
    content: '',
    header: '',
    footer: '',
    navigation: '',
    meta_description: '',
    meta_keywords: '',
    template_id: null,
    status: 'draft',
    sort_order: 0,
    show_in_nav: true,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'HTML Publisher', href: '/admin/html-pages' },
    { title: 'Pages', href: '/admin/html-pages' },
    { title: 'Create Page', href: '/admin/html-pages/create' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/html-pages');
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setData('title', value);
    if (!data.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setData('slug', slug);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Page" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div>
          <h1 className="text-3xl font-bold">Create Page</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new HTML page</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure the page title, URL, and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="About Our Congregation"
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="about-us"
                  />
                  {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                  <p className="text-sm text-gray-500">Auto-generated from title, but you can customize it</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={data.template_id?.toString() || ''}
                    onValueChange={(value) => setData('template_id', value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">No template</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Optional: Use a template for header/footer</p>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={data.status}
                    onValueChange={(value: 'draft' | 'published' | 'archived') => setData('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={data.sort_order}
                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-500">For navigation ordering</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_in_nav"
                  checked={data.show_in_nav}
                  onCheckedChange={(checked) => setData('show_in_nav', !!checked)}
                />
                <Label htmlFor="show_in_nav">Show in navigation</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Page content and layout sections</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Main Content</TabsTrigger>
                  <TabsTrigger value="header">Header</TabsTrigger>
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                  <TabsTrigger value="meta">SEO Meta</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-2">
                  <Label>Page Content *</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <RichTextEditor
                        value={data.content}
                        onChange={(value) => setData('content', value)}
                        placeholder="Enter your page content here..."
                      />
                      {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
                    </div>
                    <div>
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[400px]">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">PREVIEW</p>
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert bg-white dark:bg-black p-4 rounded"
                          dangerouslySetInnerHTML={{ __html: data.content || '<p class="text-gray-400 italic">Start typing to see preview...</p>' }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="header" className="space-y-2">
                  <Label>Header HTML</Label>
                  <RichTextEditor
                    value={data.header}
                    onChange={(value) => setData('header', value)}
                    placeholder="Optional custom header (overrides template)"
                  />
                  <p className="text-sm text-gray-500">Leave empty to use template header if a template is selected</p>
                </TabsContent>

                <TabsContent value="navigation" className="space-y-2">
                  <Label>Navigation HTML</Label>
                  <RichTextEditor
                    value={data.navigation}
                    onChange={(value) => setData('navigation', value)}
                    placeholder="Optional custom navigation"
                  />
                  <p className="text-sm text-gray-500">Leave empty to use template navigation if a template is selected</p>
                </TabsContent>

                <TabsContent value="footer" className="space-y-2">
                  <Label>Footer HTML</Label>
                  <RichTextEditor
                    value={data.footer}
                    onChange={(value) => setData('footer', value)}
                    placeholder="Optional custom footer (overrides template)"
                  />
                  <p className="text-sm text-gray-500">Leave empty to use template footer if a template is selected</p>
                </TabsContent>

                <TabsContent value="meta" className="space-y-4">
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Input
                      id="meta_description"
                      value={data.meta_description}
                      onChange={(e) => setData('meta_description', e.target.value)}
                      placeholder="A brief description of this page for search engines"
                    />
                    <p className="text-sm text-gray-500">Recommended: 150-160 characters</p>
                  </div>
                  <div>
                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                    <Input
                      id="meta_keywords"
                      value={data.meta_keywords}
                      onChange={(e) => setData('meta_keywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-sm text-gray-500">Comma-separated keywords</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Creating...' : 'Create Page'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
