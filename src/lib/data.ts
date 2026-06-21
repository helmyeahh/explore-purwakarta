export interface Location {
  latitude: number;
  longitude: number;
}

export interface VisitInfo {
  open_hours: string;
  close_hours?: string;
  estimated_price: number | string;
}

export interface RatingReview {
  average_rating: number;
  total_reviews: number;
}

export interface Interactive {
  vr_link?: string;
  main_photo?: string;
  gallery?: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  text: string;
  date: string;
}

export interface Destination {
  id: string;
  name: string;
  categories: string[];
  description: string;
  location: {
    address: string;
    coordinates: Location;
  };
  mood_tags: string[];
  interactive?: Interactive;
  visit_info: VisitInfo;
  rating_and_reviews: RatingReview;
  facilities: string[];
  distance?: string; // For mock purposes
  reviews?: Review[];
  status?: "pending" | "published";
  submittedBy?: string;
}

export const mockDestinations: Destination[] = [
  {
    id: "PWK-001",
    name: "Sate Maranggi Haji Yetty",
    categories: ["Culinary", "Family Friendly"],
    description: "Legendary local beef satay served with fresh tomato sambal. A must-visit culinary spot in Purwakarta.",
    location: {
      address: "Cibungur, Purwakarta",
      coordinates: { latitude: -6.4527, longitude: 107.4589 },
    },
    mood_tags: ["Kuliner", "Keluarga", "Santai"],
    interactive: {
      vr_link: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5pXzNfV19vM3h1cTJzN19fX19fX19fX19fX19fX19fX19fX19f!2m2!1d-6.538680!2d107.443150!3f270!4f0!5f0.7820865974627469",
    },
    visit_info: {
      open_hours: "08:00",
      close_hours: "21:00",
      estimated_price: "Rp 50.000 - Rp 100.000",
    },
    rating_and_reviews: {
      average_rating: 4.8,
      total_reviews: 1240,
    },
    facilities: ["Parking", "Toilet", "Prayer Room"],
    distance: "2.5 km"
  },
  {
    id: "PWK-002",
    name: "Jatiluhur Reservoir",
    categories: ["Nature", "Water Recreation", "Family"],
    description: "The largest reservoir in Indonesia, offering stunning sunset views, water sports, and floating restaurants.",
    location: {
      address: "Jl. Waduk Jatiluhur, Kabupaten Purwakarta, Jawa Barat",
      coordinates: { latitude: -6.523056, longitude: 107.388889 },
    },
    mood_tags: ["Healing", "Santai", "Keluarga", "Menikmati Sunset"],
    interactive: {
      vr_link: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5pXzNfV19vM3h1cTJzN19fX19fX19fX19fX19fX19fX19fX19f!2m2!1d-6.538680!2d107.443150!3f270!4f0!5f0.7820865974627469",
    },
    visit_info: {
      open_hours: "06:00",
      close_hours: "18:00",
      estimated_price: 20000,
    },
    rating_and_reviews: {
      average_rating: 4.6,
      total_reviews: 850,
    },
    facilities: ["Parking", "Toilet", "Food Stalls", "Boat Ride"],
    distance: "8.1 km"
  },
  {
    id: "PWK-003",
    name: "Sri Baduga Fountain Park",
    categories: ["Attraction", "Night Street Food", "Photo Spots"],
    description: "The largest dancing fountain in Southeast Asia, featuring spectacular water, laser, and light shows.",
    location: {
      address: "Situ Buleud, Purwakarta",
      coordinates: { latitude: -6.538680, longitude: 107.443150 },
    },
    mood_tags: ["Malam Hari", "Romantis", "Keluarga", "Instagramable"],
    interactive: {
      vr_link: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5pXzNfV19vM3h1cTJzN19fX19fX19fX19fX19fX19fX19fX19f!2m2!1d-6.538680!2d107.443150!3f270!4f0!5f0.7820865974627469",
    },
    visit_info: {
      open_hours: "19:30",
      close_hours: "21:00",
      estimated_price: "Free",
    },
    rating_and_reviews: {
      average_rating: 4.9,
      total_reviews: 2100,
    },
    facilities: ["Parking", "Toilet", "Seating Area"],
    distance: "1.2 km"
  }
];
