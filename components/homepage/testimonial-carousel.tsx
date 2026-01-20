'use client';

import Image from 'next/image';
import Carousel from '@/components/ui/carousel';
import StarRating from '@/components/star-rating';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
  productPurchased?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah M.',
    location: 'Portland, OR',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: "The tie-dye tapestry I ordered is absolutely stunning! The colors are vibrant and the craftsmanship is evident in every detail. It's now the centerpiece of my living room.",
    productPurchased: 'Sunset Spiral Tapestry',
  },
  {
    id: '2',
    name: 'Michael R.',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    text: "Best leather wallet I've ever owned. You can tell it was made by someone who truly cares about their craft. The stitching is perfect and it just gets better with age.",
    productPurchased: 'Hand-Tooled Leather Wallet',
  },
  {
    id: '3',
    name: 'Emily L.',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    text: "I bought the turquoise necklace for my mother's birthday and she absolutely loves it. The packaging was beautiful and it arrived earlier than expected.",
    productPurchased: 'Turquoise Statement Necklace',
  },
  {
    id: '4',
    name: 'David K.',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 5,
    text: "The original painting I purchased exceeds all expectations. The artist's skill is remarkable and the colors bring so much life to my home office.",
    productPurchased: 'Mountain Sunrise Canvas',
  },
  {
    id: '5',
    name: 'Jessica T.',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    text: "Supporting artisans while getting unique, high-quality products? Sign me up! Every piece I've ordered has been special. The customer service is wonderful too.",
    productPurchased: 'Handwoven Textile Set',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 h-full flex flex-col">
      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} size="sm" />
      </div>

      {/* Quote */}
      <blockquote className="flex-1">
        <p className="text-neutral-700 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
      </blockquote>

      {/* Product Purchased */}
      {testimonial.productPurchased && (
        <p className="mt-4 text-sm text-neutral-500">
          Purchased: <span className="font-medium text-primary-600">{testimonial.productPurchased}</span>
        </p>
      )}

      {/* Author */}
      <div className="mt-6 flex items-center gap-3 pt-4 border-t border-neutral-100">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div>
          <p className="font-semibold text-neutral-900">{testimonial.name}</p>
          <p className="text-sm text-neutral-500">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialCarousel() {
  return (
    <section className="bg-neutral-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl font-heading">
            Stories from Our Community
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Join thousands of seekers and dreamers who have found their treasures
            with Wildenflower.
          </p>
        </div>

        {/* Carousel */}
        <div className="px-8">
          <Carousel
            autoPlay
            autoPlayInterval={6000}
            showDots
            showArrows
            itemsPerView={{
              mobile: 1,
              tablet: 2,
              desktop: 3,
            }}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Carousel>
        </div>

        {/* Overall Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-neutral-900 font-heading">4.9</div>
            <div className="flex justify-center mt-1">
              <StarRating rating={4.9} size="sm" />
            </div>
            <div className="text-sm text-neutral-500 mt-1">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-neutral-900 font-heading">2,500+</div>
            <div className="text-sm text-neutral-500 mt-1">Happy Seekers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-neutral-900 font-heading">98%</div>
            <div className="text-sm text-neutral-500 mt-1">Would Recommend</div>
          </div>
        </div>
      </div>
    </section>
  );
}
