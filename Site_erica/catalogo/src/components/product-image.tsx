import { Flower2 } from "lucide-react";
import Image from "next/image";

export function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return <div className="image-placeholder" aria-label="Foto não disponível"><Flower2 size={42} strokeWidth={1.2} /></div>;
  }
  // URLs são gravadas pelo próprio painel no bucket público do Supabase.
  return <Image src={src} alt={alt} fill sizes="(max-width: 560px) 50vw, (max-width: 800px) 50vw, 33vw" />;
}
