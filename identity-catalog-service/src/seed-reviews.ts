/**
 * Reviews seed script — seeds 4-6 reviews per product with photos and videos
 * Usage: npx tsx src/seed-reviews.ts
 *        npx tsx src/seed-reviews.ts --force   (clears existing reviews first)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './config/env';
import { cloudinary } from './config/cloudinary';
import { Product } from './models/Product';
import { Review } from './models/Review';

// Upload a remote URL directly to Cloudinary (no download needed)
async function uploadUrlToCloudinary(url: string, folder: string, resourceType: 'image' | 'video'): Promise<string> {
  const result = await cloudinary.uploader.upload(url, { folder, resource_type: resourceType });
  return result.secure_url;
}

// ── Realistic reviewer profiles ──────────────────────────────────────────────
const REVIEWERS = [
  { userName: 'Priya Sharma',   userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { userName: 'Rahul Mehta',    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { userName: 'Ananya Gupta',   userAvatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { userName: 'Vikram Singh',   userAvatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
  { userName: 'Sneha Kapoor',   userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { userName: 'Arjun Nair',     userAvatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { userName: 'Kavya Reddy',    userAvatar: 'https://randomuser.me/api/portraits/women/90.jpg' },
  { userName: 'Dev Patel',      userAvatar: 'https://randomuser.me/api/portraits/men/77.jpg' },
  { userName: 'Ishaan Malhotra',userAvatar: 'https://randomuser.me/api/portraits/men/8.jpg'  },
  { userName: 'Riya Joshi',     userAvatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
];

// ── Fashion photos for review attachments (Unsplash) ─────────────────────────
const REVIEW_PHOTOS = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1432516154132-1a84bc92ff0c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80',
];

// ── Sample MP4 videos (small, publicly accessible) ────────────────────────────
const REVIEW_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
];

// ── Review texts by category ──────────────────────────────────────────────────
const TEXTS: Record<string, string[]> = {
  'T-Shirt': [
    "Super soft fabric, fits perfectly! Ordered M and it is true to size. Great for everyday wear.",
    'Colour is exactly as shown. Stitching quality is impressive for this price range.',
    'Wore this to the gym and it stayed comfortable all day. Highly recommend.',
    'Fast delivery, nice packaging. The tee washes well without losing shape.',
    'Looks even better in person. The material feels premium and breathable.',
    'Perfect casual wear. Simple, clean design. Will definitely buy more colours.',
  ],
  'Jacket': [
    'Excellent quality jacket! Warm yet not too heavy. Perfect for Indian winters.',
    'The fit is spot on. Tried it over a hoodie and it still looks clean and structured.',
    'Got so many compliments wearing this. Looks very expensive for the price.',
    'Zippers are smooth, stitching is solid. No complaints at all — 5 stars!',
    'Great layering piece. The inner lining is soft and cosy.',
  ],
  'Dress': [
    'Absolutely love this dress! The fabric is flowy and the print is gorgeous.',
    'Wore this to a wedding function and got tons of compliments. Very elegant.',
    'True to size, fits beautifully. The quality is far better than expected.',
    'Perfect for both casual and semi-formal events. Very versatile.',
    'The colour is vibrant and the stitching is clean. Worth every rupee!',
    'Lightweight and comfortable even in summer heat. Will buy again.',
  ],
  'Coat': [
    'Luxurious feel. Keeps me warm without looking bulky. Love the tailored cut.',
    'The wool blend is high quality and the double-breast buttons are solid.',
    "Looks very premium. Got this as a gift and it is the best coat I have owned.",
    'Perfect for Delhi winters. Elegant and functional at the same time.',
    'Fits like a dream after minor tailoring. The colour is rich and deep.',
  ],
  'Handbag': [
    'Spacious and well-structured. Fits my laptop, water bottle, and more!',
    'The vegan leather is gorgeous. Smells great, looks classy — love it.',
    'Sturdy handles and smooth zippers. Exactly what I wanted for daily use.',
    'Received so many compliments. The bag looks way more expensive than it is.',
    'Good size for travel. Pockets are well-organised and the strap is comfy.',
  ],
  'Pant': [
    'Perfect fit. The stretch fabric makes it comfortable for long sitting hours.',
    'Washed three times and still holds its shape and colour. Impressed!',
    'Smart casual look achieved easily. Great for office and outings alike.',
    'The chinos look sharp and feel light. Exactly what I needed for summer.',
    'Wide leg is on-trend and the high waist is flattering. Very happy!',
  ],
  'Shirt': [
    'Great quality Oxford shirt. Fabric is crisp and breathable. Love it!',
    'True to size. Irons well and holds the crease. Office-perfect.',
    'The linen shirt is breezy and stylish. Perfect for summer brunches.',
    'Subtle colour, clean cut. Pairs well with chinos or denim.',
    'Good stitching and button quality. Looks premium in person.',
  ],
  'Sweater': [
    'The merino wool feels incredibly soft. Not itchy at all — love it!',
    'Cable-knit pattern is beautiful. Cosy and warm for chilly evenings.',
    'Turtleneck fits snugly without being too tight. Great for layering.',
    'Cardigan drapes nicely and the buttons are solid. Very happy.',
    "Rich colour that does not fade after washing. Premium quality!",
  ],
};

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// Unique fake ObjectId for seed users
function fakeUserId(index: number) {
  return new mongoose.Types.ObjectId(`00000000000000000000${String(index).padStart(4, '0')}`);
}

async function seedReviews() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('[Seed Reviews] Connected to MongoDB');

  if (process.argv.includes('--force')) {
    await Review.deleteMany({});
    console.log('[Seed Reviews] Cleared existing reviews.');
  }

  const products = await Product.find({});
  if (products.length === 0) {
    console.log('[Seed Reviews] No products found. Run seed.ts first.');
    await mongoose.disconnect();
    return;
  }

  let totalInserted = 0;

  for (const product of products) {
    const category = product.category as string;
    const texts = TEXTS[category] ?? TEXTS['T-Shirt'];

    // Pick 4-6 unique reviewers for this product
    const reviewerCount = rand(4, 6);
    const selectedReviewers = pick(REVIEWERS, reviewerCount);

    const reviewDocs = selectedReviewers.map((reviewer, i) => {
      const rating = pick([3, 4, 4, 5, 5, 5], 1)[0]; // weighted towards 4-5 stars
      const text = texts[i % texts.length];

      // Some reviews get photos (60% chance), videos (25% chance)
      const hasPhotos = Math.random() < 0.6;
      const hasVideo  = Math.random() < 0.25;

      const photos = hasPhotos ? pick(REVIEW_PHOTOS, rand(1, 2)) : [];
      const videos = hasVideo  ? pick(REVIEW_VIDEOS, 1) : [];

      return {
        productId: product._id,
        userId: fakeUserId(i * products.length + products.indexOf(product)),
        userName: reviewer.userName,
        userAvatar: reviewer.userAvatar,
        rating,
        text,
        photos,
        videos,
        createdAt: daysAgo(rand(1, 180)),
      };
    });

    try {
      const inserted = await Review.insertMany(reviewDocs, { ordered: false });
      totalInserted += inserted.length;
      console.log(`  ✅ ${product.title} — ${inserted.length} reviews`);
    } catch (err: any) {
      // Skip duplicate key errors (already-seeded products)
      const inserted = err?.insertedDocs?.length ?? 0;
      totalInserted += inserted;
      console.log(`  ⚠️  ${product.title} — ${inserted} inserted (some skipped: duplicates)`);
    }
  }

  // Recalculate rating & reviewCount for all products based on seeded reviews
  console.log('\n[Seed Reviews] Recalculating product ratings…');
  for (const product of products) {
    const stats = await Review.aggregate([
      { $match: { productId: product._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await Product.findByIdAndUpdate(product._id, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }
  }

  console.log(`\n[Seed Reviews] ✅ Done! Total reviews inserted: ${totalInserted}`);
  await mongoose.disconnect();
}

seedReviews().catch((err) => {
  console.error('[Seed Reviews] Failed:', err);
  process.exit(1);
});
