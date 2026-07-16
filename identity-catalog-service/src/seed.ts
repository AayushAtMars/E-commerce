/**
 * Seed script — run once to populate products
 * Usage: npx tsx src/seed.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './config/env';
import { Product } from './models/Product';

const PLACEHOLDER_IMG = (w: number, h: number, color: string, text: string) =>
  `https://placehold.co/${w}x${h}/${color}/ffffff.png?text=${encodeURIComponent(text)}`;

const SELLERS = [
  { sellerName: 'TrendHive', sellerAvatar: PLACEHOLDER_IMG(40, 40, '401900', 'T'), sellerRole: 'Fashion Brand' },
  { sellerName: 'StyleCraft', sellerAvatar: PLACEHOLDER_IMG(40, 40, 'F8B057', 'S'), sellerRole: 'Premium Seller' },
  { sellerName: 'UrbanWear', sellerAvatar: PLACEHOLDER_IMG(40, 40, '797979', 'U'), sellerRole: 'Urban Fashion' },
  { sellerName: 'LuxeDrape', sellerAvatar: PLACEHOLDER_IMG(40, 40, '242424', 'L'), sellerRole: 'Luxury Fashion' },
];

const products = [
  // T-Shirts
  {
    title: 'Classic Cotton Crew Tee',
    description: 'A timeless crew-neck t-shirt made from 100% organic cotton. Soft, breathable, and perfect for everyday wear.',
    category: 'T-Shirt',
    price: 899, discountPrice: 649,
    colors: ['#FFFFFF', '#242424', '#401900', '#F8B057'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80'],
    rating: 4.5, reviewCount: 128, ...SELLERS[0],
    isFlashSale: true, isBestSeller: false, stock: 200,
  },
  {
    title: 'Oversized Graphic Tee',
    description: 'Bold graphic print on an ultra-soft oversized tee. Street-style ready with a relaxed drop-shoulder fit.',
    category: 'T-Shirt',
    price: 1199, discountPrice: 899,
    colors: ['#F6F6F6', '#401900'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80'],
    rating: 4.3, reviewCount: 87, ...SELLERS[2],
    isFlashSale: false, isBestSeller: true, stock: 150,
  },
  {
    title: 'Striped Polo T-Shirt',
    description: 'Classic polo with fine stripe pattern. Pique cotton fabric with three-button placket.',
    category: 'T-Shirt',
    price: 1499,
    colors: ['#FFFFFF', '#242424', '#401900'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    images: ['https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=400&q=80'],
    rating: 4.7, reviewCount: 203, ...SELLERS[1],
    isFlashSale: true, isBestSeller: true, stock: 300,
  },

  // Jackets
  {
    title: 'Slim Fit Denim Jacket',
    description: 'A wardrobe staple — mid-weight denim jacket with a clean slim fit. Pairs perfectly with everything.',
    category: 'Jacket',
    price: 3499, discountPrice: 2799,
    colors: ['#1a1a5e', '#242424', '#6b4226'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1551537482-f209bfc73f32?auto=format&fit=crop&w=400&q=80'],
    rating: 4.8, reviewCount: 356, ...SELLERS[3],
    isFlashSale: false, isBestSeller: true, stock: 80,
  },
  {
    title: 'Quilted Puffer Jacket',
    description: 'Lightweight quilted puffer with a modern boxy silhouette. Water-resistant outer shell.',
    category: 'Jacket',
    price: 4999, discountPrice: 3999,
    colors: ['#401900', '#242424', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80'],
    rating: 4.6, reviewCount: 142, ...SELLERS[1],
    isFlashSale: true, isBestSeller: false, stock: 60,
  },
  {
    title: 'Bomber Jacket',
    description: 'Classic satin bomber with ribbed cuffs and collar. Lined interior for warmth.',
    category: 'Jacket',
    price: 2999,
    colors: ['#242424', '#401900', '#355e3b'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80'],
    rating: 4.4, reviewCount: 95, ...SELLERS[2],
    isFlashSale: false, isBestSeller: true, stock: 45,
  },

  // Dresses
  {
    title: 'Floral Wrap Midi Dress',
    description: 'Effortlessly feminine wrap dress in a vibrant floral print. Adjustable tie waist and midi length.',
    category: 'Dress',
    price: 2499, discountPrice: 1899,
    colors: ['#FF6B9D', '#F8B057', '#6B5B95'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80'],
    rating: 4.9, reviewCount: 412, ...SELLERS[3],
    isFlashSale: true, isBestSeller: true, stock: 120,
  },
  {
    title: 'Sleeveless Bodycon Dress',
    description: 'Figure-flattering bodycon silhouette in stretch jersey fabric. Perfect for evenings out.',
    category: 'Dress',
    price: 1999,
    colors: ['#242424', '#401900', '#FFFFFF', '#C0392B'],
    sizes: ['XS', 'S', 'M', 'L'],
    images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=400&q=80'],
    rating: 4.2, reviewCount: 78, ...SELLERS[0],
    isFlashSale: false, isBestSeller: false, stock: 90,
  },
  {
    title: 'Linen Shirt Dress',
    description: 'Relaxed shirt dress in premium linen. Belted waist, front buttons, and roll-up sleeves.',
    category: 'Dress',
    price: 2199, discountPrice: 1699,
    colors: ['#F5F0E0', '#D2B48C', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80'],
    rating: 4.6, reviewCount: 189, ...SELLERS[2],
    isFlashSale: true, isBestSeller: false, stock: 75,
  },

  // Coats
  {
    title: 'Double-Breasted Wool Coat',
    description: 'Timeless double-breasted coat in premium wool blend. Tailored fit with notch lapels.',
    category: 'Coat',
    price: 7999, discountPrice: 6499,
    colors: ['#242424', '#8B7355', '#F5F0E0'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=400&q=80'],
    rating: 4.9, reviewCount: 267, ...SELLERS[3],
    isFlashSale: false, isBestSeller: true, stock: 30,
  },
  {
    title: 'Trench Coat',
    description: 'Classic belted trench coat in water-repellent cotton. An iconic piece for any wardrobe.',
    category: 'Coat',
    price: 5999,
    colors: ['#D2B48C', '#242424'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=400&q=80'],
    rating: 4.7, reviewCount: 158, ...SELLERS[1],
    isFlashSale: true, isBestSeller: true, stock: 40,
  },

  // Handbags
  {
    title: 'Structured Tote Bag',
    description: 'Roomy structured tote in premium vegan leather. Multiple interior pockets and a detachable pouch.',
    category: 'Handbag',
    price: 3999, discountPrice: 2999,
    colors: ['#401900', '#242424', '#D4AF37'],
    sizes: ['One Size'],
    images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=400&q=80'],
    rating: 4.8, reviewCount: 523, ...SELLERS[3],
    isFlashSale: true, isBestSeller: true, stock: 50,
  },
  {
    title: 'Mini Crossbody Bag',
    description: 'Compact crossbody with adjustable chain strap. Card slots, zip closure.',
    category: 'Handbag',
    price: 2299,
    colors: ['#C0C0C0', '#D4AF37', '#401900'],
    sizes: ['One Size'],
    images: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=400&q=80'],
    rating: 4.5, reviewCount: 312, ...SELLERS[0],
    isFlashSale: false, isBestSeller: true, stock: 70,
  },

  // Pants
  {
    title: 'Slim Fit Chinos',
    description: 'Versatile slim-fit chinos in stretch twill. Smart-casual essential for any occasion.',
    category: 'Pant',
    price: 1999, discountPrice: 1499,
    colors: ['#D2B48C', '#242424', '#355e3b', '#401900'],
    sizes: ['28', '30', '32', '34', '36'],
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80'],
    rating: 4.4, reviewCount: 267, ...SELLERS[1],
    isFlashSale: false, isBestSeller: true, stock: 160,
  },
  {
    title: 'Wide-Leg Trousers',
    description: 'Elevated wide-leg trousers in woven crepe. High-rise waist with centre crease.',
    category: 'Pant',
    price: 2499,
    colors: ['#242424', '#F5F0E0', '#401900'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80'],
    rating: 4.6, reviewCount: 143, ...SELLERS[3],
    isFlashSale: true, isBestSeller: false, stock: 80,
  },

  // Shirts
  {
    title: 'Oxford Button-Down Shirt',
    description: 'Classic Oxford cloth button-down in a relaxed fit. Versatile for work or weekend.',
    category: 'Shirt',
    price: 1799, discountPrice: 1399,
    colors: ['#FFFFFF', '#87CEEB', '#F0E68C', '#F4A460'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80'],
    rating: 4.7, reviewCount: 389, ...SELLERS[1],
    isFlashSale: false, isBestSeller: true, stock: 220,
  },
  {
    title: 'Linen Casual Shirt',
    description: 'Breathable linen shirt with a relaxed Cuban collar. Perfect for warm-weather styling.',
    category: 'Shirt',
    price: 1599,
    colors: ['#FFFFFF', '#D2B48C', '#87CEEB'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1604695573706-53170668f6a6?auto=format&fit=crop&w=400&q=80'],
    rating: 4.3, reviewCount: 112, ...SELLERS[2],
    isFlashSale: true, isBestSeller: false, stock: 100,
  },

  // Sweaters
  {
    title: 'Cable-Knit Crewneck Sweater',
    description: 'Chunky cable-knit crewneck in 100% merino wool. Cosy and timeless.',
    category: 'Sweater',
    price: 3499, discountPrice: 2799,
    colors: ['#F5F0E0', '#401900', '#242424', '#B22222'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=400&q=80'],
    rating: 4.8, reviewCount: 445, ...SELLERS[3],
    isFlashSale: false, isBestSeller: true, stock: 90,
  },
  {
    title: 'Turtleneck Sweater',
    description: 'Fine-gauge turtleneck in soft ribbed cotton. Minimalist and elegant.',
    category: 'Sweater',
    price: 2299,
    colors: ['#242424', '#401900', '#FFFFFF', '#B8860B'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80'],
    rating: 4.5, reviewCount: 231, ...SELLERS[0],
    isFlashSale: true, isBestSeller: true, stock: 110,
  },
  {
    title: 'V-Neck Cardigan',
    description: 'Lightweight V-neck cardigan in recycled cotton blend. Versatile layering piece.',
    category: 'Sweater',
    price: 1999, discountPrice: 1599,
    colors: ['#F0E68C', '#87CEEB', '#401900', '#F5F0E0'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80'],
    rating: 4.4, reviewCount: 178, ...SELLERS[2],
    isFlashSale: false, isBestSeller: false, stock: 130,
  },
];

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('[Seed] Connected to MongoDB');

  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`[Seed] ${existing} products already exist. Skipping. (Pass --force to re-seed)`);
    if (!process.argv.includes('--force')) {
      await mongoose.disconnect();
      return;
    }
    await Product.deleteMany({});
    console.log('[Seed] Cleared existing products.');
  }

  const created = await Product.insertMany(products);
  console.log(`[Seed] ✅ Inserted ${created.length} products`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
