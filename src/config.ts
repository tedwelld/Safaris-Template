// Public contact values are supplied by Vite at build time.
export const supportEmail = (import.meta.env.VITE_EMAIL_SUPPORT || "").trim();
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const whatsappMessage = import.meta.env.VITE_WHATSAPP_MESSAGE || "";
export const whatsappUrl = whatsappNumber
  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
  : "";

const poweredByWhatsappNumber = (import.meta.env.VITE_AXENTRA_WHATSAPP_NUMBER || "").replace(/\D/g, "");
export const poweredByWhatsappUrl = poweredByWhatsappNumber ? `https://wa.me/${poweredByWhatsappNumber}` : "";
