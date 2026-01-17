export interface Review {
  id: string;
  productId: string; // The product handle
  userId: string;
  userName: string;
  rating: number; // 1-5
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  photos?: string[]; // URLs to review photos
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    [key: number]: number; // 1: 10, 2: 5, etc.
  };
}
