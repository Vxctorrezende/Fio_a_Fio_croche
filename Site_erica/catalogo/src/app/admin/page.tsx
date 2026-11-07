"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, LoaderCircle, PackagePlus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatarValor } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import type { Produto } from "@/lib/types";

export default function AdminPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarProdutos = useCallback(async () => {
    const supabase = createClient();
    const { data, error: loadError } = await supabase.from("produtos").select("*").order("criado_em", { ascending: false });
    if (loadError) setErro(`Não foi possível carregar os produtos: ${loadError.message}`);
    else setProdutos(data ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    carregarProdutos();
    const channel = supabase.channel("admin-produtos")
      .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, carregarProdutos)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [carregarProdutos]);

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0] ?? null;
    setErro("");
    if (!arquivo) { setFoto(null); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setErro("Envie uma imagem JPG, PNG ou WEBP.");
      event.target.value = "";
      setFoto(null);
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      setFoto(null);
      return;
    }
    setFoto(arquivo);
  }

  async function adicionar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    const valorNumerico = Number(valor.replace(",", "."));
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro("Informe um valor válido maior que zero.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    let imagemUrl: string | null = null;
    let caminhoImagem: string | null = null;

    if (foto) {
      const extensao = foto.name.split(".").pop()?.toLowerCase() || "jpg";
      caminhoImagem = `${crypto.randomUUID()}.${extensao}`;
      const { error: uploadError } = await supabase.storage.from("produtos").upload(caminhoImagem, foto, { contentType: foto.type, upsert: false });
      if (uploadError) {
        setErro(`Não foi possível enviar a foto: ${uploadError.message}`);
        setSalvando(false);
        return;
      }
      imagemUrl = supabase.storage.from("produtos").getPublicUrl(caminhoImagem).data.publicUrl;
    }

    const { error: insertError } = await supabase.from("produtos").insert({ nome: nome.trim(), valor: valorNumerico, imagem_url: imagemUrl });
    if (insertError) {
      let detalheLimpeza = "";
      if (caminhoImagem) {
        const { error: cleanupError } = await supabase.storage.from("produtos").remove([caminhoImagem]);
        if (cleanupError) detalheLimpeza = ` A foto enviada também não pôde ser removida: ${cleanupError.message}`;
      }
      setErro(`Não foi possível cadastrar o produto: ${insertError.message}.${detalheLimpeza}`);
      setSalvando(false);
      return;
    }
    setNome("");
    setValor("");
    setFoto(null);
    const inputFoto = document.getElementById("foto-produto") as HTMLInputElement | null;
    if (inputFoto) inputFoto.value = "";
    setMensagem("Produto adicionado com sucesso!");
    setSalvando(false);
    await carregarProdutos();
  }

  async function excluir(produto: Produto) {
    if (!window.confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) return;
    setMensagem("");
    setErro("");
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("produtos").delete().eq("id", produto.id);
    if (deleteError) {
      setErro(`Não foi possível excluir o produto: ${deleteError.message}`);
      return;
    }
    if (produto.imagem_url) {
      const prefixo = "/storage/v1/object/public/produtos/";
      const caminho = produto.imagem_url.split(prefixo)[1];
      if (caminho) {
        const { error: storageError } = await supabase.storage.from("produtos").remove([decodeURIComponent(caminho)]);
        if (storageError) setErro(`Produto removido, mas não foi possível apagar a foto: ${storageError.message}`);
      }
    }
    setMensagem((atual) => atual || "Produto excluído com sucesso.");
    await carregarProdutos();
  }

  return (
    <main className="main-content">
      <div className="admin-top">
        <div><Link className="back-link" href="/"><ArrowLeft size={15} /> Voltar ao catálogo</Link><span className="eyebrow">Área exclusiva</span><h1>Painel da loja</h1></div>
      </div>

      <section className="admin-panel">
        <h2>Adicionar uma peça</h2>
        <form className="admin-form" onSubmit={adicionar}>
          <label className="form-field">Nome do produto<input required maxLength={100} value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex.: Bolsa Primavera" /></label>
          <label className="form-field">Valor (R$)<input required type="number" min="0.01" step="0.01" value={valor} onChange={(event) => setValor(event.target.value)} placeholder="0,00" /></label>
          <label className="form-field file-field">Foto do produto (opcional)<input id="foto-produto" type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} /></label>
          <button className="button button-primary" disabled={salvando}>{salvando ? <LoaderCircle size={16} className="animate-spin" /> : foto ? <ImagePlus size={16} /> : <PackagePlus size={16} />} Adicionar</button>
        </form>
        {erro && <div role="alert" className="alert alert-error">{erro}</div>}
        {mensagem && <div role="status" className="alert alert-success">{mensagem}</div>}
      </section>

      <section className="admin-list" aria-labelledby="admin-products-title">
        <div className="admin-list-title"><span id="admin-products-title">Seus produtos</span><span>{produtos.length} {produtos.length === 1 ? "peça" : "peças"}</span></div>
        {carregando ? <div className="admin-row"><LoaderCircle size={18} className="animate-spin" /> Carregando produtos...</div> : produtos.length === 0 ? <div className="empty-state"><p>Você ainda não cadastrou nenhuma peça.</p></div> : produtos.map((produto) => (
          <div className="admin-row" key={produto.id}>
            <div className="admin-thumb"><ProductImage src={produto.imagem_url} alt="" /></div>
            <div className="admin-product-name">{produto.nome}<div style={{ color: "var(--rose-dark)", font: "600 13px 'Trebuchet MS', sans-serif", marginTop: 4 }}>{formatarValor(Number(produto.valor))}</div></div>
            <button type="button" className="button button-danger" onClick={() => excluir(produto)} aria-label={`Excluir ${produto.nome}`}><Trash2 size={16} /><span className="mobile-only">Excluir</span></button>
          </div>
        ))}
      </section>
    </main>
  );
}
