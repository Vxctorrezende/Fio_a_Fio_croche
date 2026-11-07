export function formatarValor(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function linkWhatsApp(nome: string, valor: number) {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const mensagem = `Olá! Tenho interesse no produto ${nome} - ${formatarValor(valor)}`;
  return `https://wa.me/${numero ?? ""}?text=${encodeURIComponent(mensagem)}`;
}
