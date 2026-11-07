"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function atualizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) setErro(error.message);
    else setMensagem("Senha atualizada! Você já pode entrar com sua nova senha.");
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <span className="brand-mark"><Sparkles size={20} /></span>
        <h1>Escolha uma nova senha</h1>
        <p>Use pelo menos 8 caracteres para proteger sua conta.</p>
        <form onSubmit={atualizar}>
          <label className="form-field">Nova senha<input required type="password" minLength={8} autoComplete="new-password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Mínimo de 8 caracteres" /></label>
          {erro && <div role="alert" className="alert alert-error">{erro}</div>}
          {mensagem && <div role="status" className="alert alert-success">{mensagem} <Link className="text-link" href="/login">Entrar</Link></div>}
          <button className="button button-primary" disabled={carregando}>{carregando ? <LoaderCircle size={17} className="animate-spin" /> : null} Salvar nova senha</button>
        </form>
      </section>
    </main>
  );
}
