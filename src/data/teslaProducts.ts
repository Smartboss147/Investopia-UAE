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
  }
];
