interface OrderItem {
    title: string;
    quantity: number;
    price: string;
}

interface OrderConfirmationEmailProps {
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
    total: string;
}

export const OrderConfirmationEmail = ({
    orderNumber,
    customerName,
    items,
    total,
}: OrderConfirmationEmailProps) => (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
        <h1>Order Confirmed #{orderNumber}</h1>
        <p>Hi {customerName},</p>
        <p>Thanks for your order! We&apos;re getting it ready to be shipped.</p>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee' }}>
            {items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <span>{item.quantity}x {item.title}</span>
                    <span>{item.price}</span>
                </div>
            ))}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
            Total: {total}
        </div>
    </div>
);

export default OrderConfirmationEmail;
