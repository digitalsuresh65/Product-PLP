export const product = {
  id: "embroidered-one-piece-dress",
  name: "Hand-Embroidered One-Piece Dress",
  shortName: "One-Piece Dress",
  description:
    "A graceful stretchable one-piece dress finished with delicate hand embroidery for effortless, all-day elegance.",
  regularPrice: 5000,
  discountPercent: 10,
  offerPrice: 4500,
  currency: "NPR",
  deliveryNote:
    "Free delivery inside Kathmandu Valley. Delivery outside the Valley will be confirmed by phone before dispatch.",
  images: [
    {
      src: "/products/one-piece-full.png",
      alt: "Full-length view of the hand-embroidered berry one-piece dress",
    },
    {
      src: "/products/one-piece-handwork.png",
      alt: "Close view of the floral hand embroidery on the dress",
    },
    {
      src: "/products/one-piece-back.png",
      alt: "Back view of the stretchable one-piece dress",
    },
  ],
  benefits: [
    {
      title: "Hand-embroidered detail",
      description: "Floral handwork gives every look a refined, artisanal finish.",
    },
    {
      title: "Comfortable stretch",
      description: "Flexible fabric moves with you and feels easy throughout the day.",
    },
    {
      title: "Cool & breathable feel",
      description: "A comfortable choice for warm days, gatherings, and everyday wear.",
    },
    {
      title: "Easy one-piece styling",
      description: "A complete, polished outfit without complicated pairing.",
    },
  ],
} as const;

export const MAX_QUANTITY = 10;

export function formatNpr(amount: number) {
  return `NPR ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function calculateTotal(quantity: number) {
  return product.offerPrice * quantity;
}
