import { verifyAdmin, logoutAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuthenticated = await verifyAdmin();

    if (!isAuthenticated) {
        redirect('/admin/login');
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold tracking-tight">ShopSite Admin</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="block px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/reviews"
                        className="block px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        Reviews
                    </Link>
                </nav>
                <div className="p-4 border-t border-zinc-800">
                    <form action={async () => {
                        'use server';
                        await logoutAdmin();
                        redirect('/admin/login');
                    }}>
                        <button type="submit" className="w-full text-left px-4 py-2 text-zinc-400 hover:text-white transition-colors">
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="md:hidden bg-zinc-900 text-white p-4 flex justify-between items-center">
                    <h2 className="font-bold">ShopSite Admin</h2>
                    <Link href="/admin/reviews" className="text-sm text-zinc-300">Reviews</Link>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
