import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/format";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl("Hello Mandela Heritage Furnitures, I'd like to enquire.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-whatsapp text-white shadow-lg grid place-items-center hover:scale-105 transition-transform"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
