import { ShopifyOrder } from '@/types/shopify';
import { formatMoney } from '@/lib/shopify-helpers';

interface OrderListProps {
    orders: ShopifyOrder[];
}

export default function OrderList({ orders }: OrderListProps) {
    if (orders.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="font-semibold text-gray-900">
                                Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                                {new Date(order.processedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">
                                {formatMoney(order.totalPrice)}
                            </p>
                            <div className="flex gap-2 text-sm mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.financialStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.financialStatus}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.fulfillmentStatus === 'FULFILLED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.fulfillmentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4">
                        <ul className="divide-y divide-gray-100">
                            {order.lineItems.edges.map(({ node: item }, index) => (
                                <li key={index} className="py-2 flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.quantity}x {item.title}
                                    </span>
                                    <span className="text-gray-900 font-medium">
                                        {formatMoney(item.originalTotalPrice)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
