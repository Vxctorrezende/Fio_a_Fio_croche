"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Sparkles, MessageCircle, Flower2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatarValor, linkWhatsApp } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import type { Produto } from "@/lib/types";

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const supabase = createClient();
    async function carregar() {
      const { data, error } = await supabase.from("produtos").select("*").order("criado_em", { ascending: false });
      if (error) setErro("Não foi possível carregar o catálogo. Tente novamente em instantes.");
      else setProdutos(data ?? []);
    }
    carregar();
    const channel = supabase.channel("catalogo-produtos")
      .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, carregar)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtrados = useMemo(() => produtos.filter((produto) => produto.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))), [produtos, busca]);

  return (
    <main className="main-content">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Peças únicas, feitas à mão</span>
          <h1 className="serif">Um carinho em<br />forma de crochê.</h1>
          <p>Cada ponto carrega tempo, afeto e cuidado. Encontre uma peça feita especialmente para encantar você.</p>
          <div className="hero-note"><Heart size={16} fill="currentColor" /> Artesanato feito com amor, fio a fio</div>
        </div>
      </section>

      <section aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <div><span className="eyebrow">Nosso cantinho</span><h2 className="serif" id="catalog-title">Peças disponíveis</h2></div>
          <label className="search-box"><Search size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar uma peça..." aria-label="Buscar produtos pelo nome" /></label>
        </div>

        {erro && <div role="alert" className="alert alert-error">{erro}</div>}
        {!erro && filtrados.length === 0 ? (
          <div className="empty-state"><Flower2 size={40} strokeWidth={1.2} /><h3>{busca ? "Nenhuma peça encontrada" : "Novidades em breve"}</h3><p>{busca ? "Tente buscar por outro nome." : "Estamos preparando peças lindas para você. Volte logo!"}</p></div>
        ) : (
          <div className="product-grid">
            {filtrados.map((produto) => (
              <article className="product-card" key={produto.id}>
                <Link href={`/produto/${produto.id}`} className="product-image"><ProductImage src={produto.imagem_url} alt={produto.nome} /></Link>
                <div className="product-info">
                  <Link href={`/produto/${produto.id}`} className="product-name">{produto.nome}</Link>
                  <div className="product-price">{formatarValor(Number(produto.valor))}</div>
                  <a className="button button-whatsapp" href={linkWhatsApp(produto.nome, Number(produto.valor))} target="_blank" rel="noreferrer">
                    <MessageCircle size={16} /> Pedir pelo WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="mobile-only"><Sparkles size={14} /></div>
    </main>
  );
}
