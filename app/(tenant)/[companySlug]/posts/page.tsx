'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Layout, Plus, Edit2, Trash2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    authorEmail: string;
}

interface User {
    email: string;
    roles: string[];
}

export default function PostsPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Access Denied", { description: "You might not have permission to view posts." });
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchPosts();
    }, [isAuthenticated]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/posts', { title: newTitle, content: newContent });
            toast.success("Post created!");
            setNewTitle('');
            setNewContent('');
            fetchPosts();
        } catch (err: unknown) {
            console.error(err);
            toast.error("Action Denied", { description: "You don't have permission to create posts." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditStart = (post: Post) => {
        setEditingPost(post);
        setEditTitle(post.title);
        setEditContent(post.content);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;
        setIsSubmitting(true);
        try {
            await api.put(`/posts/${editingPost.id}`, { title: editTitle, content: editContent });
            toast.success("Post updated!");
            setEditingPost(null);
            fetchPosts();
        } catch (err: unknown) {
            console.error(err);
            toast.error("Action Denied", { description: "You don't have permission to edit this post." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/posts/${id}`);
            toast.success("Post deleted!");
            fetchPosts();
        } catch (err: unknown) {
            console.error(err);
            toast.error("Action Denied", { description: "You don't have permission to delete this post." });
        }
    };

    if (loading) return <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center text-cyan-400 font-mono">LOADING...</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 pb-20">
            <nav className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center">
                        <Layout className="mr-3 h-6 w-6 text-cyan-400" />
                        Posts & Permissions
                    </h1>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                    Logged in as: <span className="text-cyan-400 font-bold">{(user as User)?.roles?.join(', ')}</span>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-sm sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center">
                                <Plus className="mr-2 h-5 w-5 text-cyan-400" />
                                Create Post
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <Input
                                    placeholder="Title"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                />
                                <textarea
                                    className="w-full bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all outline-none min-h-[120px]"
                                    placeholder="Content..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    required
                                />
                                <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-gray-900 dark:text-white rounded-xl" isLoading={isSubmitting}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Publish
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">All Posts</h2>
                    {posts.length === 0 && <p className="text-gray-600 italic">No posts available or no permission to view.</p>}
                    {posts.map(post => {
                        const isAuthor = (user as User)?.email === post.authorEmail;
                        const isAdmin = (user as User)?.roles?.includes('ROLE_ADMIN');
                        const isSuperAdmin = (user as User)?.roles?.includes('ROLE_SUPER_ADMIN');

                        return (
                            <Card key={post.id} className="bg-gray-900/40 border-gray-800/50 backdrop-blur-sm group hover:border-cyan-500/20 transition-all">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{post.title}</h3>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                                                By <span className="text-gray-500 dark:text-gray-400 font-bold ml-1">{post.author}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {(isAuthor || isAdmin || isSuperAdmin) && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-9 w-9 text-gray-400 dark:text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl"
                                                    onClick={() => handleEditStart(post)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {isSuperAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-9 w-9 text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {editingPost?.id === post.id ? (
                                        <form onSubmit={handleUpdate} className="mt-4 space-y-4 bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
                                            <Input
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                required
                                                className="bg-gray-900/50"
                                            />
                                            <textarea
                                                className="w-full bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all outline-none min-h-[100px]"
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                required
                                            />
                                            <div className="flex space-x-2">
                                                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500" isLoading={isSubmitting}>Update</Button>
                                                <Button size="sm" variant="ghost" type="button" onClick={() => setEditingPost(null)}>Cancel</Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{post.content}</p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
