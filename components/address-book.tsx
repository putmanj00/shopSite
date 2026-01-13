import { ShopifyMailingAddress } from '@/types/shopify';

interface AddressBookProps {
    addresses: ShopifyMailingAddress[];
    defaultAddress: ShopifyMailingAddress | null;
}

export default function AddressBook({ addresses, defaultAddress }: AddressBookProps) {
    if (addresses.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No addresses saved.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {addresses.map((address) => {
                const isDefault = defaultAddress?.id === address.id;

                return (
                    <div
                        key={address.id}
                        className={`p-6 bg-white border rounded-lg ${isDefault ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-gray-900">
                                {address.firstName} {address.lastName}
                            </h3>
                            {isDefault && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    Default
                                </span>
                            )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>{address.company}</p>
                            <p>{address.address1}</p>
                            {address.address2 && <p>{address.address2}</p>}
                            <p>
                                {address.city}, {address.province} {address.zip}
                            </p>
                            <p>{address.country}</p>
                            {address.phone && <p className="mt-2 text-gray-500">{address.phone}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
