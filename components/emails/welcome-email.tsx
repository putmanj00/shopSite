interface WelcomeEmailProps {
    firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
        <h1 style={{ color: '#2563eb' }}>Welcome to ShopSite, {firstName}!</h1>
        <p>We&apos;re thrilled to have you on board.</p>
        <p>Feel free to browse our latest collections and find something you love.</p>
        <a
            href="http://localhost:3000/collections/all"
            style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                marginTop: '16px'
            }}
        >
            Start Shopping
        </a>
    </div>
);

export default WelcomeEmail;
