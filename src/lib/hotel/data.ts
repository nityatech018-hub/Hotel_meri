import { IMG } from "./images";
import { addDays, toISODate } from "./pricing";
import type {
  Booking,
  BookingStatus,
  CategoryId,
  HotelState,
  PaymentStatus,
  Room,
  RoomCategory,
} from "./types";

/** SAMPLE prices (INR per night). Edit freely — these are demo values. */
export const CATEGORIES: RoomCategory[] = [
  {
    id: "deluxe",
    name: "Deluxe Room",
    tagline: "Quiet comfort, beautifully appointed",
    description:
      "A calm retreat with a plush king bed, velvet headboard and soft city light — ideal for couples and solo travellers.",
    price: 3499,
    maxGuests: 2,
    bed: "1 King Bed",
    size: "28 m²",
    image: IMG.deluxe,
    amenities: ["Free Wi‑Fi", "Air conditioning", "Smart TV", "Tea & coffee", "Rain shower"],
  },
  {
    id: "premium",
    name: "Premium Room",
    tagline: "Twin queens with a skyline view",
    description:
      "Generous twin queen beds, a reading corner and sweeping views — space to unwind for friends or small families.",
    price: 4999,
    maxGuests: 3,
    bed: "2 Queen Beds",
    size: "34 m²",
    image: IMG.premium,
    amenities: ["Free Wi‑Fi", "City view", "Mini bar", "Smart TV", "Breakfast included"],
  },
  {
    id: "executive",
    name: "Executive Room",
    tagline: "Built for the business traveller",
    description:
      "A refined king room with a full work desk, ergonomic chair and evening turndown — productivity meets indulgence.",
    price: 6499,
    maxGuests: 2,
    bed: "1 King Bed",
    size: "38 m²",
    image: IMG.executive,
    amenities: [
      "High‑speed Wi‑Fi",
      "Work desk",
      "Lounge access",
      "Espresso machine",
      "Breakfast included",
    ],
  },
  {
    id: "family",
    name: "Family Room",
    tagline: "Room for everyone to settle in",
    description:
      "A king bed plus two singles and a lounge area, so the whole family can stay together in comfort.",
    price: 7999,
    maxGuests: 5,
    bed: "1 King + 2 Single",
    size: "52 m²",
    image: IMG.family,
    amenities: ["Free Wi‑Fi", "Sofa lounge", "Kids amenities", "Mini fridge", "Breakfast for 4"],
  },
  {
    id: "suite",
    name: "Luxury Suite",
    tagline: "Our most royal address",
    description:
      "A separate living salon, marble bath with soaking tub and dedicated butler service — the full Meri experience.",
    price: 11999,
    maxGuests: 3,
    bed: "1 Super King Bed",
    size: "78 m²",
    image: IMG.suite,
    amenities: ["Butler service", "Living room", "Soaking tub", "Airport transfer", "All meals"],
  },
];

export const categoryById = (id: CategoryId, list: RoomCategory[] = CATEGORIES) =>
  list.find((c) => c.id === id) ?? list[0]!;

function makeRooms(): Room[] {
  const plan: [CategoryId, number, number][] = [
    ["deluxe", 1, 8],
    ["premium", 2, 6],
    ["executive", 3, 4],
    ["family", 3, 4],
    ["suite", 4, 2],
  ];
  const rooms: Room[] = [];
  const floorCount: Record<number, number> = {};
  for (const [cat, floor, n] of plan) {
    for (let i = 0; i < n; i++) {
      floorCount[floor] = (floorCount[floor] ?? 0) + 1;
      rooms.push({
        number: `${floor}${String(floorCount[floor]).padStart(2, "0")}`,
        categoryId: cat,
        floor,
        status: "available",
      });
    }
  }
  rooms[3]!.status = "cleaning";
  rooms[12]!.status = "maintenance";
  return rooms;
}

const NAMES = [
  "Aarav Sharma",
  "Priya Nair",
  "Rohan Mehta",
  "Ananya Iyer",
  "Vikram Singh",
  "Kavya Reddy",
  "Arjun Kapoor",
  "Isha Banerjee",
  "Kabir Malhotra",
  "Meera Joshi",
  "Siddharth Rao",
  "Neha Gupta",
  "Aditya Verma",
  "Riya Das",
  "Karan Chopra",
  "Sneha Pillai",
  "Rahul Bose",
  "Tanvi Kulkarni",
  "Dev Patel",
  "Pooja Menon",
  "Nikhil Jain",
  "Aisha Khan",
  "Varun Desai",
  "Diya Chatterjee",
];

/** Small deterministic PRNG so the seeded demo data is stable. */
function prng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export const DEMO_GUEST = {
  email: "guest@merihotel.demo",
  password: "guest123",
  name: "Aarav Sharma",
  phone: "+91 98765 43210",
};
export const DEMO_RECEPTION = {
  email: "reception@merihotel.demo",
  password: "admin123",
  name: "Front Desk",
  phone: "+91 90000 00000",
};

export const TAX_RATE = 0.12;

function makeBookings(today: string, rooms: Room[]): Booking[] {
  const rand = prng(42);
  const list: Booking[] = [];
  let n = 0;
  const idFor = () => {
    n++;
    return `HMR-${(100000 + n * 7919).toString(36).toUpperCase().slice(-6).padStart(6, "Q")}`;
  };
  const roomOf = (cat: CategoryId, offset: number) => {
    const opts = rooms.filter((r) => r.categoryId === cat && r.status === "available");
    return opts[offset % opts.length]?.number;
  };
  const push = (
    name: string,
    cat: CategoryId,
    inOffset: number,
    nights: number,
    status: BookingStatus,
    payment: PaymentStatus,
    opts: Partial<Booking> = {},
  ) => {
    const c = categoryById(cat);
    const checkIn = addDays(today, inOffset);
    const roomsCount = opts.rooms ?? 1;
    const subtotal = c.price * nights * roomsCount;
    const total = subtotal + Math.round(subtotal * TAX_RATE);
    const email = opts.email ?? name.toLowerCase().replace(/\s+/g, ".") + "@example.com";
    list.push({
      id: idFor(),
      guestName: name,
      email,
      phone: opts.phone ?? `+91 9${Math.floor(100000000 + rand() * 899999999)}`,
      categoryId: cat,
      checkIn,
      checkOut: addDays(checkIn, nights),
      guests: opts.guests ?? Math.min(c.maxGuests, 2),
      rooms: roomsCount,
      status,
      payment,
      amountPaid:
        payment === "Paid"
          ? total
          : payment === "Partial"
            ? Math.round(total * 0.3)
            : payment === "Refunded"
              ? 0
              : 0,
      total,
      source: opts.source ?? (rand() > 0.7 ? "Walk-in" : rand() > 0.5 ? "Phone" : "Website"),
      createdAt: addDays(checkIn, -Math.floor(3 + rand() * 20)),
      roomNumber: opts.roomNumber,
      requests: opts.requests,
    });
  };

  // Demo guest's own bookings
  push(DEMO_GUEST.name, "suite", 9, 3, "Confirmed", "Partial", {
    email: DEMO_GUEST.email,
    phone: DEMO_GUEST.phone,
    source: "Website",
    requests: "Anniversary — flowers in room please",
  });
  push(DEMO_GUEST.name, "deluxe", 1, 2, "Pending", "Unpaid", {
    email: DEMO_GUEST.email,
    phone: DEMO_GUEST.phone,
    source: "Website",
  });
  push(DEMO_GUEST.name, "executive", -40, 2, "Checked-Out", "Paid", {
    email: DEMO_GUEST.email,
    phone: DEMO_GUEST.phone,
    source: "Website",
    roomNumber: "302",
  });
  push(DEMO_GUEST.name, "premium", -95, 3, "Checked-Out", "Paid", {
    email: DEMO_GUEST.email,
    phone: DEMO_GUEST.phone,
    source: "Website",
    roomNumber: "204",
  });

  // Currently in house
  const inHouse: [CategoryId, number, number][] = [
    ["deluxe", -2, 4],
    ["deluxe", -1, 3],
    ["premium", -3, 5],
    ["executive", -1, 2],
    ["family", -2, 3],
    ["suite", -1, 1],
    ["premium", 0, 2],
    ["deluxe", -4, 4],
  ];
  inHouse.forEach(([cat, off, nights], i) => {
    push(
      NAMES[(i + 1) % NAMES.length]!,
      cat,
      off,
      nights,
      "Checked-In",
      i % 3 === 0 ? "Partial" : "Paid",
      {
        roomNumber: roomOf(cat, i),
      },
    );
  });

  // Arriving today (to check in)
  push(NAMES[10]!, "premium", 0, 2, "Confirmed", "Partial");
  push(NAMES[11]!, "family", 0, 3, "Confirmed", "Unpaid", { guests: 4 });
  push(NAMES[12]!, "deluxe", 0, 1, "Pending", "Unpaid", { source: "Phone" });

  // Upcoming
  const upcoming: [CategoryId, number, number, BookingStatus, PaymentStatus][] = [
    ["executive", 2, 2, "Confirmed", "Paid"],
    ["deluxe", 3, 3, "Confirmed", "Partial"],
    ["suite", 5, 2, "Pending", "Unpaid"],
    ["family", 6, 4, "Confirmed", "Paid"],
    ["premium", 8, 2, "Cancelled", "Refunded"],
    ["deluxe", 12, 2, "Confirmed", "Partial"],
  ];
  upcoming.forEach(([cat, off, nights, st, pay], i) =>
    push(NAMES[13 + i]!, cat, off, nights, st, pay),
  );

  // Past stays for revenue history
  const cats: CategoryId[] = ["deluxe", "premium", "executive", "family", "suite"];
  for (let i = 0; i < 46; i++) {
    const cat = cats[Math.floor(rand() * rand() * cats.length)]!;
    const off = -Math.floor(2 + rand() * 88);
    const nights = 1 + Math.floor(rand() * 4);
    const cancelled = rand() > 0.92;
    push(
      NAMES[Math.floor(rand() * NAMES.length)]!,
      cat,
      off,
      nights,
      cancelled ? "Cancelled" : "Checked-Out",
      cancelled ? "Refunded" : "Paid",
      {
        roomNumber: cancelled ? undefined : roomOf(cat, i),
      },
    );
  }
  return list;
}

export const STATE_VERSION = 1;

export function createSeedState(today: string = toISODate(new Date())): HotelState {
  const rooms = makeRooms();
  return {
    version: STATE_VERSION,
    categories: CATEGORIES,
    rooms,
    bookings: makeBookings(today, rooms),
    users: [
      { ...DEMO_GUEST, city: "Kolkata", role: "guest" },
      { ...DEMO_RECEPTION, role: "reception" },
    ],
    session: null,
    messages: [],
    settings: {
      hotelName: "Hotel Meri & Residency",
      address: "[Hotel address — 12 Royal Avenue, Your City, State 700001]",
      phone: "+91 00000 00000",
      email: "stay@merihotel.example",
      whatsapp: "910000000000",
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      taxRate: TAX_RATE,
    },
  };
}
