/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeslaProduct } from '../types/tesla';

export const initialTeslaProducts: Partial<TeslaProduct>[] = [
  {
    name: 'Model Y',
    slug: 'model-y',
    category: 'Vehicles',
    description: 'Model Y is a fully electric, mid-size SUV with unparalleled protection and versatile cargo space.',
    price: 193990,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: true,
    specifications: {
      range: '533 km',
      topSpeed: '250 km/h',
      acceleration: '3.7s 0-100 km/h'
    }
  },
  {
    name: 'Model 3',
    slug: 'model-3',
    category: 'Vehicles',
    description: 'Model 3 is built for safety, with power and performance to take you anywhere you want to go.',
    price: 174990,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: true,
    specifications: {
      range: '629 km',
      topSpeed: '201 km/h',
      acceleration: '4.4s 0-100 km/h'
    }
  },
  {
    name: 'Model X',
    slug: 'model-x',
    category: 'Vehicles',
    description: 'Model X is the highest performing SUV ever built, featuring Falcon Wing doors and seating for up to seven.',
    price: 364990,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      range: '576 km',
      topSpeed: '250 km/h',
      acceleration: '2.6s 0-100 km/h'
    }
  },
  {
    name: 'Model S',
    slug: 'model-s',
    category: 'Vehicles',
    description: 'Model S is built for speed and endurance, with ludicrous acceleration and a refined interior.',
    price: 334990,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      range: '723 km',
      topSpeed: '322 km/h',
      acceleration: '2.1s 0-100 km/h'
    }
  },
  {
    name: 'Cybertruck',
    slug: 'cybertruck',
    category: 'Vehicles',
    description: 'Built for any adventure, Cybertruck has a durable exterior and spacious interior.',
    price: 350000,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1662010021854-e67c538ea7a9?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1662010021854-e67c538ea7a9?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Coming Soon',
    featured: true,
    specifications: {
      range: '547 km',
      topSpeed: '209 km/h',
      acceleration: '2.7s 0-100 km/h'
    }
  },
  {
    name: 'Wall Connector',
    slug: 'wall-connector',
    category: 'Charging',
    description: 'Wall Connector is an efficient and convenient home charging solution that lets you plug your vehicle in overnight.',
    price: 1800,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      power: 'Up to 22 kW',
      cableLength: '7.3m',
      connectivity: 'Wi-Fi'
    }
  },
  {
    name: 'Mobile Connector',
    slug: 'mobile-connector',
    category: 'Charging',
    description: 'Charge your Tesla from a standard outlet with the Mobile Connector kit.',
    price: 900,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1620218973322-83955688a2e1?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1620218973322-83955688a2e1?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      voltage: '120V / 240V',
      cableLength: '6m'
    }
  },
  {
    name: 'Tesla Wall Art',
    slug: 'tesla-wall-art',
    category: 'Lifestyle',
    description: 'Add a touch of Tesla to your home or office with our premium wall art.',
    price: 450,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      material: 'Aluminum',
      dimensions: '60x40 cm'
    }
  },
  {
    name: 'T-Logo Hat',
    slug: 't-logo-hat',
    category: 'Accessories',
    description: 'A classic baseball cap featuring the Tesla T-logo.',
    price: 150,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      material: '100% Cotton',
      size: 'Adjustable'
    }
  },
  {
    name: 'Tesla Wireless Charger',
    slug: 'wireless-charger',
    category: 'Technology',
    description: 'A sleek wireless charger for your smartphone, inspired by the design of the Cybertruck.',
    price: 350,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1615948812087-673c523359ee?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1615948812087-673c523359ee?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      power: '15W',
      compatibility: 'Qi-enabled devices'
    }
  },
  {
    name: 'Cybertruck Hoodie',
    slug: 'cybertruck-hoodie',
    category: 'Accessories',
    description: 'Stay warm and stylish with the Cybertruck inspired hoodie.',
    price: 320,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      material: 'Organic Cotton Mix',
      fit: 'Relaxed'
    }
  },
  {
    name: 'Model S Diecast',
    slug: 'model-s-diecast',
    category: 'Lifestyle',
    description: 'A 1:18 scale diecast model of the Tesla Model S.',
    price: 850,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1594732832278-abd644401426?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1594732832278-abd644401426?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      scale: '1:18',
      material: 'Die-cast Metal'
    }
  },
  {
    name: 'Tesla Key Fob',
    slug: 'key-fob',
    category: 'Technology',
    description: 'A stylish key fob for your Model S or Model X.',
    price: 650,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      compatibility: 'Model S, Model X',
      connectivity: 'Bluetooth Low Energy'
    }
  },
  {
    name: 'Pet Liner',
    slug: 'pet-liner',
    category: 'Accessories',
    description: 'Keep your Tesla clean while traveling with your furry friends.',
    price: 550,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      material: 'Waterproof Polyester',
      compatibility: 'Model Y, Model 3'
    }
  },
  {
    name: 'Sentry Mode SSD',
    slug: 'sentry-ssd',
    category: 'Technology',
    description: 'High-speed SSD for Sentry Mode and Dashcam recording.',
    price: 450,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      capacity: '1TB',
      interface: 'USB-C'
    }
  },
  {
    name: 'Tesla Umbrella',
    slug: 'tesla-umbrella',
    category: 'Lifestyle',
    description: 'A sturdy and elegant umbrella with the Tesla logo.',
    price: 180,
    currency: 'AED',
    thumbnail: 'https://images.unsplash.com/photo-1565345719810-7212130e5218?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1565345719810-7212130e5218?auto=format&fit=crop&q=80&w=1200'],
    availability: 'Available',
    featured: false,
    specifications: {
      diameter: '110 cm',
      material: 'Windproof Fiber'
    }
  }
];
