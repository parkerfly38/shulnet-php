import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Key, 
    Trash2, 
    Copy, 
    CheckCircle,
    AlertCircle,
    Calendar,
    Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System', href: '/admin/settings' },
    { title: 'API Tokens', href: '/admin/api-tokens' },
];

interface Token {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string;
}

interface Props {
    tokens: Token[];
}

export default function ApiTokensPage({ tokens }: Readonly<Props>) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [tokenName, setTokenName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newToken, setNewToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const handleCreateToken = async () => {
        if (!tokenName || !email || !password) {
            setCreateError('All fields are required');
            return;
        }

        setIsCreating(true);
        setCreateError(null);

        try {
            const response = await fetch('/api/tokens/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    email,
                    password,
                    token_name: tokenName,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setNewToken(data.data.token);
                setTokenName('');
                setEmail('');
                setPassword('');
            } else {
                setCreateError(data.message || 'Failed to create token');
            }
        } catch (error) {
            console.error('Error creating token:', error);
            setCreateError('An error occurred while creating the token');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyToken = () => {
        if (newToken) {
            navigator.clipboard.writeText(newToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCloseDialog = () => {
        setShowCreateDialog(false);
        setNewToken(null);
        setCopied(false);
        setCreateError(null);
        if (newToken) {
            router.reload();
        }
    };

    const handleDeleteToken = async (tokenId: number, tokenName: string) => {
        if (!confirm(`Are you sure you want to revoke the token "${tokenName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/tokens/${tokenId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                router.reload();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to revoke token');
            }
        } catch (error) {
            console.error('Error revoking token:', error);
            alert('An error occurred while revoking the token');
        }
    };

    const handleDeleteAllTokens = async () => {
        if (!confirm('Are you sure you want to revoke ALL API tokens? This will immediately invalidate all existing tokens.')) {
            return;
        }

        try {
            const response = await fetch('/api/tokens', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                router.reload();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to revoke tokens');
            }
        } catch (error) {
            console.error('Error revoking tokens:', error);
            alert('An error occurred while revoking tokens');
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="API Tokens" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Tokens</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage API tokens for server-to-server authentication</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Token
                    </Button>
                </div>

                {/* Info Alert */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        API tokens allow external servers to authenticate with your ShulNet API. Treat tokens like passwords and never share them publicly.
                    </AlertDescription>
                </Alert>

                {/* Tokens List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Active Tokens</CardTitle>
                            <CardDescription>
                                {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'} active
                            </CardDescription>
                        </div>
                        {tokens.length > 0 && (
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={handleDeleteAllTokens}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Revoke All
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {tokens.length === 0 ? (
                            <div className="text-center py-12">
                                <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    No API tokens
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Create your first API token to start integrating with external systems
                                </p>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Token
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tokens.map((token) => (
                                    <div
                                        key={token.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Key className="h-4 w-4 text-gray-500" />
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {token.name}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Created {formatDate(token.created_at)}
                                                </span>
                                                <span>
                                                    Last used: {formatDate(token.last_used_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteToken(token.id, token.name)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documentation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Using API Tokens</CardTitle>
                        <CardDescription>How to authenticate with your API token</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Authentication Header</h4>
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm">
                                Authorization: Bearer YOUR_TOKEN_HERE
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Example cURL Request</h4>
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                                curl -X GET {typeof window !== 'undefined' ? window.location.origin : ''}/api/admin/members \<br />
                                &nbsp;&nbsp;-H "Authorization: Bearer YOUR_TOKEN_HERE" \<br />
                                &nbsp;&nbsp;-H "Accept: application/json"
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                For full API documentation, visit{' '}
                                <a href="/docs/api" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                    /docs/api
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Token Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={handleCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {newToken ? 'Token Created Successfully' : 'Create API Token'}
                        </DialogTitle>
                        <DialogDescription>
                            {newToken 
                                ? 'Copy your token now. For security reasons, it won\'t be shown again.'
                                : 'Create a new API token for server-to-server authentication'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {newToken ? (
                        <div className="space-y-4">
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Make sure to copy your token now. You won't be able to see it again!
                                </AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                                <Label>Your API Token</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newToken}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        onClick={handleCopyToken}
                                        variant={copied ? 'default' : 'outline'}
                                    >
                                        {copied ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {createError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{createError}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="token-name">Token Name</Label>
                                <Input
                                    id="token-name"
                                    placeholder="e.g., Production Server"
                                    value={tokenName}
                                    onChange={(e) => setTokenName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Your Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Your Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {newToken ? (
                            <Button onClick={handleCloseDialog}>Done</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateToken} disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create Token'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
