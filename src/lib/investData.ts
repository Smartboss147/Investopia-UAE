export interface Statistic {
  value: string;
  label: string;
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  image: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  category: 'Flagship' | 'Global' | 'Dialogue' | 'Update';
  description: string;
}

export interface Initiative {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export const navItems: NavItem[] = [
  { label: 'من نحن', path: '/about' },
  { label: 'Initiatives', path: '/initiatives' },
  { label: 'Events', path: '/events' },
  { label: 'Knowledge Hub', path: '/knowledge' },
  { label: 'Reports', path: '/reports' },
  { label: 'تواصل معنا', path: '/contact' },
];

export const statistics: Statistic[] = [
  { value: '2,700+', label: 'المشاركون' },
  { value: '100+', label: 'المتحدثون' },
  { value: '15+', label: 'Countries Represented' },
  { value: '40+', label: 'Panel Discussions' },
];

export const recentEvents: Event[] = [
  {
    id: '1',
    title: 'Investopia Bridge 2026',
    date: 'Upcoming 2026',
    location: 'Global',
    image: '/events/investopia_bridge_2026_banner_1788863783631.jpg',
    category: 'Global',
    description: 'A gathering of senior leaders to examine the economic and investment implications of a rapidly changing global environment.',
  },
  {
    id: '2',
    title: 'Investopia Flagship 2025',
    date: 'Feb 26, 2025',
    location: 'Abu Dhabi, UAE',
    image: '/events/investopia_flagship_stage_1788863815327.jpg',
    category: 'Flagship',
    description: "Investopia's annual gathering in the UAE brings together thought leaders, investors, and innovators to drive growth.",
  },
  {
    id: '3',
    title: 'Investopia Quarterly Digest',
    date: 'Q1 and Q2 | 2026',
    location: 'Knowledge Hub',
    image: '/events/investopia_quarterly_digest_banner_1788863798884.jpg',
    category: 'Update',
    description: 'A comprehensive analysis of global investment trends and economic forecasts for the upcoming year.',
  },
];

export const initiatives: Initiative[] = [
  {
    id: '1',
    title: 'Flagship Edition',
    description: 'The premier annual gathering of global investment leaders in Abu Dhabi.',
    image: 'https://images.unsplash.com/photo-1574950578143-858c6fc58922?q=80&w=800&auto=format&fit=crop',
    link: '/initiatives/flagship',
  },
  {
    id: '2',
    title: 'Global Editions',
    description: 'Expanding the investment ecosystem through strategic international events.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    link: '/initiatives/global',
  },
  {
    id: '3',
    title: 'Communities',
    description: 'Fostering dialogue and collaboration across specialized economic sectors.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop',
    link: '/initiatives/communities',
  },
];
