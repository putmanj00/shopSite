import fs from 'fs/promises';
import path from 'path';
import { Review, ReviewStats } from '@/types/reviews';

const DB_PATH = path.join(process.cwd(), 'data', 'reviews.json');

// Ensure data directory exists
async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DB_PATH, '[]');
  }
}

export async function getAllReviews(): Promise<Review[]> {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getReviewsByProduct(handle: string): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews
    .filter((r) => r.productId === handle && r.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt' | 'status' | 'helpfulCount'>): Promise<Review> {
  const reviews = await getAllReviews();
  const newReview: Review = {
    ...review,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
    status: 'approved', // Auto-approve for demo purposes
    helpfulCount: 0,
    verifiedPurchase: true, // Default to true for demo
    photos: review.photos || [],
  };
  
  reviews.push(newReview);
  await fs.writeFile(DB_PATH, JSON.stringify(reviews, null, 2));
  return newReview;
}

export async function markReviewHelpful(id: string): Promise<void> {
  const reviews = await getAllReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index !== -1) {
    reviews[index].helpfulCount = (reviews[index].helpfulCount || 0) + 1;
    await fs.writeFile(DB_PATH, JSON.stringify(reviews, null, 2));
  }
}

export function calculateReviewStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach((r) => {
    const rating = Math.round(r.rating);
    if (distribution[rating] !== undefined) {
      distribution[rating]++;
    }
  });

  return {
    averageRating: parseFloat((sum / total).toFixed(1)),
    totalReviews: total,
    distribution,
  };
}

export async function updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  const reviews = await getAllReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index !== -1) {
    reviews[index].status = status;
    await fs.writeFile(DB_PATH, JSON.stringify(reviews, null, 2));
  }
}

export async function deleteReview(id: string): Promise<void> {
  const reviews = await getAllReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  await fs.writeFile(DB_PATH, JSON.stringify(filtered, null, 2));
}

