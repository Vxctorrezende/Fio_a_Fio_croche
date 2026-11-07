"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Heart, LoaderCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      setErro(error.message.includes("Invalid login credentials") ? "E-mail ou senha incorretos." : error.message);
      setCarregando(false);
      return;
    }
    window.location.assign("/");
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <span className="brand-mark"><Sparkles size={20} /></span>
        <h1>Que bom ter você aqui</h1>
        <p>Entre para descobrir nossas peças feitas com carinho.</p>
        <form onSubmit={entrar}>
          <label className="form-field">E-mail<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" /></label>
          <label className="form-field">Senha<input required type="password" autoComplete="current-password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Sua senha" /></label>
          {erro && <div role="alert" className="alert alert-error">{erro}</div>}
          <button className="button button-primary" disabled={carregando}>{carregando ? <LoaderCircle size={17} className="animate-spin" /> : <Heart size={16} />} Entrar</button>
        </form>
        <Link className="text-link forgot-link" href="/esqueci-senha">Esqueci minha senha</Link>
        <p className="auth-switch">Ainda não tem uma conta? <Link href="/cadastro">Cadastre-se</Link></p>
      </section>
    </main>
  );
}
