export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string | null;
  price: number;
  discountPrice?: number | null;
  currency: string;
  level?: string;
  rating?: number;
  totalReviews?: number;
  totalEnrollments?: number;
  category?: { id: string; name: string; slug?: string } | string;
  instructor?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  };
  sections?: Section[];
}

export interface Section {
  id: string;
  title: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration?: number;
  isPreview?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatar?: string | null;
}
