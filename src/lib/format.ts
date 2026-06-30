export function formatKES(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "";
  return "KSh " + new Intl.NumberFormat("en-KE").format(amount);
}

export const WHATSAPP_NUMBER = "254701333358";
export const BUSINESS_EMAIL = "mandelaheritagefurniture@gmail.com";
export const BUSINESS_NAME = "Mandela Heritage Furnitures";
export const BUSINESS_ADDRESS = "Eastern Bypass, Mihango, Nairobi";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryMessage(name: string, price: number, url?: string) {
  return `Hello Mandela Heritage Furnitures,\n\nI'd like to enquire about:\n• ${name}\n• Price: ${formatKES(price)}${url ? `\n• Link: ${url}` : ""}\n\nIs it available? Thank you.`;
}

export function orderConfirmationMessage(args: {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
}) {
  const lines = args.items.map(i => `• ${i.name} x${i.qty} — ${formatKES(i.price * i.qty)}`).join("\n");
  return `Hello Mandela Heritage Furnitures,\n\nI'd like to confirm my order #${args.orderId.slice(0, 8).toUpperCase()}:\n\n${lines}\n\nTotal: ${formatKES(args.total)}\n\nName: ${args.name}\nPhone: ${args.phone}\nDelivery: ${args.address}\n\nPlease advise on payment & delivery.`;
}
