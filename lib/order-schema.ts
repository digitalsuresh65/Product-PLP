import { z } from "zod";
import { MAX_QUANTITY, product } from "@/lib/product";

export const orderInputSchema = z.object({
  requestId: z.string().uuid("Unable to verify this order request. Please refresh and try again."),
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(24, "Phone number is too long.")
    .regex(/^[+()\d\s-]+$/, "Please enter a valid phone number."),
  email: z.string().trim().email("Please enter a valid email address."),
  location: z
    .string()
    .trim()
    .min(5, "Please share your exact location.")
    .max(300, "Location is too long."),
  productId: z.literal(product.id),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1.")
    .max(MAX_QUANTITY, `Quantity cannot exceed ${MAX_QUANTITY}.`),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export type OrderRecord = OrderInput & {
  orderId: string;
  dateTime: string;
  productName: string;
  pricePerPiece: number;
  totalPrice: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
};
