"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Heart, LoaderCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    setCarregando(false);
    if (error) setErro(error.message);
    else setMensagem("Quase lá! Confira seu e-mail para confirmar a conta e acessar o catálogo.");
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <span className="brand-mark"><Sparkles size={20} /></span>
        <h1>Faça parte do nosso cantinho</h1>
        <p>Crie sua conta e conheça o catálogo da Fio a Fio Crochê.</p>
        <form onSubmit={cadastrar}>
          <label className="form-field">E-mail<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" /></label>
          <label className="form-field">Senha<input required type="password" minLength={8} autoComplete="new-password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Mínimo de 8 caracteres" /></label>
          {erro && <div role="alert" className="alert alert-error">{erro}</div>}
          {mensagem && <div role="status" className="alert alert-success">{mensagem}</div>}
          <button className="button button-primary" disabled={carregando}>{carregando ? <LoaderCircle size={17} className="animate-spin" /> : <Heart size={16} />} Criar minha conta</button>
        </form>
        <p className="auth-switch">Já tem uma conta? <Link href="/login">Entrar</Link></p>
      </section>
    </main>
  );
}
