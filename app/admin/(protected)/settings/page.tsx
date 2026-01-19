'use client';

import { useState } from 'react';

export default function SettingsPage() {
    // This state would ideally come from a CMS or database
    const [settings, setSettings] = useState({
        heroTitle: 'Artisan Crafted Goods',
        heroSubtitle: 'Handmade with love and tradition',
        featuredCollectionTitle: 'Seasonal Favorites',
        enablePromotions: true,
        promoBannerText: 'Free shipping on orders over $100',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would save to API/Server Action
        alert('Settings saved successfully!');
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg px-8 py-6 space-y-6">

                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Homepage Content</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700">Hero Section Title</label>
                            <input
                                type="text"
                                id="heroTitle"
                                name="heroTitle"
                                value={settings.heroTitle}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
                            <input
                                type="text"
                                id="heroSubtitle"
                                name="heroSubtitle"
                                value={settings.heroSubtitle}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="featuredCollectionTitle" className="block text-sm font-medium text-gray-700">Featured Collection Title</label>
                            <input
                                type="text"
                                id="featuredCollectionTitle"
                                name="featuredCollectionTitle"
                                value={settings.featuredCollectionTitle}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Promotions</h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                id="enablePromotions"
                                name="enablePromotions"
                                type="checkbox"
                                checked={settings.enablePromotions}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="enablePromotions" className="ml-3 block text-sm font-medium text-gray-700">
                                Enable Promotional Banner
                            </label>
                        </div>

                        {settings.enablePromotions && (
                            <div>
                                <label htmlFor="promoBannerText" className="block text-sm font-medium text-gray-700">Banner Text</label>
                                <input
                                    type="text"
                                    id="promoBannerText"
                                    name="promoBannerText"
                                    value={settings.promoBannerText}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                />
                            </div>
                        )}
                    </div>
                </section>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div >
    );
}
