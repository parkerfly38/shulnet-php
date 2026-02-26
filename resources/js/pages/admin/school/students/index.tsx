import React, { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, Edit, Trash2, Upload, Download } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const breadcrums: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Students', href: '/admin/school/students' },
];

function fetchJson(url: string, opts: any = {}) {
    const tokenMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    const token = tokenMeta ? tokenMeta.content : '';
    const headers = Object.assign({ 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, opts.headers || {});
    if (token) headers['X-CSRF-TOKEN'] = token;
    return fetch(url, Object.assign({ credentials: 'same-origin', headers }, opts)).then((r) => r.ok ? r.json() : Promise.reject(r));
}

export default function StudentsIndex() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState<string>(new URLSearchParams(window.location.search).get('search') || '');
    const [page, setPage] = useState<number>(Number(new URLSearchParams(window.location.search).get('page')) || 1);
    const [perPage] = useState<number>(25);
    const [total, setTotal] = useState<number>(0);
    const [from, setFrom] = useState<number>(0);
    const [to, setTo] = useState<number>(0);
    const [lastPage, setLastPage] = useState<number>(1);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { flash } = usePage().props as any;

    function updateUrl(p: number = 1, s: string = '') {
        const params = new URLSearchParams();
        if (s) params.append('search', s);
        if (p > 1) params.append('page', p.toString());
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    function load(p: number = 1, s: string = '')
    {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page',String(p));
        params.set('per_page', String(perPage));
        if (s) params.set('q',s);
        fetchJson(`/api/admin/students?${params.toString()}`)
            .then((json) => {
                const list = Array.isArray(json.data) ? json.data : (json.data ?? []);
                setData(list);
                setTotal(json.total || 0);
                setFrom(json.from || 0);
                setTo(json.to || 0);
                setLastPage(json.last_page || 1);
                updateUrl(p, s);
            })
            .catch(() => {
                setData([]);
                setTotal(0);
                setFrom(0);
                setTo(0);
                setLastPage(1);
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(page,search); }, []);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        load(1, search);
    }

    function goToPage(p: number)
    {
        load(p, search);
    }

    function handleDelete(id: number, name: string) {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        fetchJson(`/api/admin/students/${id}`, { method: 'DELETE' })
            .then(() => load(page, search))
            .catch((err) => alert('Failed to delete student'));
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        router.post('/admin/school/students/import', formData, {
            onSuccess: () => {
                setShowImportDialog(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                load(page, search); // Reload the data
            },
        });
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/admin/school/students/template/download';
    };

    return (
        <AppLayout breadcrumbs={breadcrums} >
            <Head title="Students - School Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                        {flash.error}
                    </div>
                )}
                
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Students</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage student records and information</p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Import Students
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Import Students from CSV</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file to import or update students. Download the template to see the required format.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <Button
                                            variant="outline"
                                            onClick={handleDownloadTemplate}
                                            className="w-full flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download CSV Template
                                        </Button>
                                    </div>
                                    <div className="border-t pt-4">
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileSelect}
                                            className="cursor-pointer"
                                        />
                                        {selectedFile && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                Selected: {selectedFile.name}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleImport}
                                        disabled={!selectedFile}
                                        className="w-full"
                                    >
                                        Import Students
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        
                        <Link href="/admin/school/students/create">
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Student
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-black rounded-lg border p-4"> 
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{total}</p>
                    </div>
                </div>

                <div className="flex gap-4 items-end">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="text" placeholder="Search students by name or email..." value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} className="pl-10" />
                        </div>
                        <Button type="submit" variant="outline">Search</Button>
                    </form>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">Showing {from || (data.length?1:0)} to {to || data.length} of {total} students</div>

                <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DOB</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                                {data.length > 0 ? (
                                    data.map((it, idx) => (
                                        <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {it.first_name} {it.middle_name} {it.last_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.gender}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.date_of_birth || it.dob}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/admin/school/students/${it.id}`}>
                                                        <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                                                    </Link>
                                                    <Link href={`/admin/school/students/${it.id}/edit`}>
                                                        <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                                                    </Link>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => handleDelete(it.id, `${it.first_name} ${it.last_name}`)}
                                                        className="text-red-600 hover:text-red-700 hover:border-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="text-gray-500 dark:text-gray-400">No students found.</div>
                                            <Link href="/admin/school/students/create" className="mt-2 inline-block"><Button>Add your first student</Button></Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {lastPage > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {page > 1 && <Button variant="outline" onClick={() => goToPage(page - 1)}>Previous</Button>}
                            {page < lastPage && <Button variant="outline" onClick={() => goToPage(page + 1)}>Next</Button>}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {lastPage}</div>
                    </div>
                )}
            </div>
        </AppLayout>
            
    )
    
}
