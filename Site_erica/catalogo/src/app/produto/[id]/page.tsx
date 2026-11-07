"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatarValor, linkWhatsApp } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import type { Produto } from "@/lib/types";

export default function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [id, setId] = useState("");

  useEffect(() => { params.then(({ id: produtoId }) => setId(produtoId)); }, [params]);
  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase.from("produtos").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      setProduto(data);
      if (error) setErro("Não foi possível carregar esta peça. Tente novamente.");
      setCarregando(false);
    });
  }, [id]);

  if (carregando) return <main className="main-content detail-wrap">Carregando peça...</main>;
  if (!produto) return <main className="main-content detail-wrap"><Link className="back-link" href="/"><ArrowLeft size={16} /> Voltar ao catálogo</Link><div className="empty-state"><h3>{erro ? "Ops, algo deu errado" : "Peça não encontrada"}</h3><p>{erro}</p></div></main>;

  return (
    <main className="main-content detail-wrap">
      <Link className="back-link" href="/"><ArrowLeft size={16} /> Voltar ao catálogo</Link>
      <article className="detail-card">
        <div className="detail-image"><ProductImage src={produto.imagem_url} alt={produto.nome} /></div>
        <div className="detail-copy">
          <span className="eyebrow">Feito à mão, fio a fio</span>
          <h1>{produto.nome}</h1>
          <div className="detail-price">{formatarValor(Number(produto.valor))}</div>
          <p>Uma peça artesanal feita com todo o cuidado e carinho. Fale com a gente para saber mais e garantir a sua!</p>
          <a className="button button-whatsapp" href={linkWhatsApp(produto.nome, Number(produto.valor))} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Pedir pelo WhatsApp</a>
        </div>
      </article>
    </main>
  );
}
