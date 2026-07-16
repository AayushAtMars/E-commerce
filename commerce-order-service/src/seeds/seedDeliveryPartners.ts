/**
 * Seed script — 20 delivery partners
 * Run via: npx ts-node src/seeds/seedDeliveryPartners.ts
 * Or via the admin API POST /api/admin/seed-delivery-partners
 */
import { DeliveryPartner } from '../models/DeliveryPartner';

// Using ui-avatars.com for realistic placeholder avatars (no login needed)
// and pravatar.cc for photo-style avatars
export const DELIVERY_PARTNERS_SEED = [
  {
    name: 'Rajan Kumar',
    phone: '+91 98765 43210',
    avatar: 'https://i.pravatar.cc/150?img=12',
    vehicle: 'Honda Activa · MH 01 AB 1234',
    rating: 4.8,
  },
  {
    name: 'Priya Mehta',
    phone: '+91 98765 11223',
    avatar: 'https://i.pravatar.cc/150?img=47',
    vehicle: 'TVS Jupiter · KA 05 CD 5678',
    rating: 4.6,
  },
  {
    name: 'Arjun Singh',
    phone: '+91 98765 99887',
    avatar: 'https://i.pravatar.cc/150?img=33',
    vehicle: 'Bajaj Pulsar · DL 01 EF 9012',
    rating: 4.9,
  },
  {
    name: 'Deepika Sharma',
    phone: '+91 91234 56789',
    avatar: 'https://i.pravatar.cc/150?img=5',
    vehicle: 'Honda CB Shine · MH 02 GH 3456',
    rating: 4.7,
  },
  {
    name: 'Vikram Patel',
    phone: '+91 99887 65432',
    avatar: 'https://i.pravatar.cc/150?img=18',
    vehicle: 'Royal Enfield Bullet · GJ 01 IJ 7890',
    rating: 4.5,
  },
  {
    name: 'Sneha Iyer',
    phone: '+91 87654 32109',
    avatar: 'https://i.pravatar.cc/150?img=44',
    vehicle: 'Honda Dio · TN 09 KL 1234',
    rating: 4.8,
  },
  {
    name: 'Mohammed Raza',
    phone: '+91 76543 21098',
    avatar: 'https://i.pravatar.cc/150?img=25',
    vehicle: 'Yamaha FZ · MH 04 MN 5678',
    rating: 4.6,
  },
  {
    name: 'Kavitha Reddy',
    phone: '+91 65432 10987',
    avatar: 'https://i.pravatar.cc/150?img=49',
    vehicle: 'Suzuki Access · AP 28 OP 9012',
    rating: 4.7,
  },
  {
    name: 'Rahul Sharma',
    phone: '+91 54321 09876',
    avatar: 'https://i.pravatar.cc/150?img=7',
    vehicle: 'Hero Splendor · UP 80 QR 3456',
    rating: 4.9,
  },
  {
    name: 'Ananya Gupta',
    phone: '+91 43210 98765',
    avatar: 'https://i.pravatar.cc/150?img=39',
    vehicle: 'TVS Scooty · HR 26 ST 7890',
    rating: 4.5,
  },
  {
    name: 'Suresh Nair',
    phone: '+91 32109 87654',
    avatar: 'https://i.pravatar.cc/150?img=15',
    vehicle: 'Honda Unicorn · KL 07 UV 1234',
    rating: 4.8,
  },
  {
    name: 'Pooja Verma',
    phone: '+91 21098 76543',
    avatar: 'https://i.pravatar.cc/150?img=56',
    vehicle: 'Yamaha Ray Z · RJ 45 WX 5678',
    rating: 4.6,
  },
  {
    name: 'Amit Joshi',
    phone: '+91 10987 65432',
    avatar: 'https://i.pravatar.cc/150?img=22',
    vehicle: 'Bajaj CT100 · MP 09 YZ 9012',
    rating: 4.7,
  },
  {
    name: 'Sunita Rao',
    phone: '+91 90876 54321',
    avatar: 'https://i.pravatar.cc/150?img=43',
    vehicle: 'Honda Activa 6G · KA 51 AB 3456',
    rating: 4.4,
  },
  {
    name: 'Karan Malhotra',
    phone: '+91 89765 43210',
    avatar: 'https://i.pravatar.cc/150?img=3',
    vehicle: 'Yamaha R15 · DL 7C CD 7890',
    rating: 4.9,
  },
  {
    name: 'Lakshmi Pillai',
    phone: '+91 78654 32109',
    avatar: 'https://i.pravatar.cc/150?img=41',
    vehicle: 'TVS Phoenix · TN 22 EF 1234',
    rating: 4.6,
  },
  {
    name: 'Dinesh Chauhan',
    phone: '+91 67543 21098',
    avatar: 'https://i.pravatar.cc/150?img=10',
    vehicle: 'Hero Passion · GJ 05 GH 5678',
    rating: 4.5,
  },
  {
    name: 'Rina Bose',
    phone: '+91 56432 10987',
    avatar: 'https://i.pravatar.cc/150?img=60',
    vehicle: 'Suzuki Let\'s · WB 06 IJ 9012',
    rating: 4.7,
  },
  {
    name: 'Prakash Dubey',
    phone: '+91 45321 09876',
    avatar: 'https://i.pravatar.cc/150?img=29',
    vehicle: 'Honda CD110 · UP 65 KL 3456',
    rating: 4.8,
  },
  {
    name: 'Meena Krishnan',
    phone: '+91 34210 98765',
    avatar: 'https://i.pravatar.cc/150?img=48',
    vehicle: 'TVS Star City · TN 38 MN 7890',
    rating: 4.6,
  },
];

export async function seedDeliveryPartners() {
  const existing = await DeliveryPartner.countDocuments();
  if (existing >= DELIVERY_PARTNERS_SEED.length) {
    console.log(`[seed] Delivery partners already seeded (${existing} found). Skipping.`);
    return { skipped: true, count: existing };
  }

  // Clear and re-seed
  await DeliveryPartner.deleteMany({});
  const result = await DeliveryPartner.insertMany(DELIVERY_PARTNERS_SEED);
  console.log(`[seed] Inserted ${result.length} delivery partners.`);
  return { skipped: false, count: result.length };
}
