import React from 'react';

interface LegalLayoutProps {
    children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
    return (
        <div className="bg-[#fdfaf5] min-h-screen py-20 px-6">
            <article className="max-w-3xl mx-auto prose prose-stone lg:prose-xl font-serif">
                {children}
            </article>
        </div>
    );
}
