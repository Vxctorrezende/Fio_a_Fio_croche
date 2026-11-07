"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    setCarregando(false);
    if (error) setErro(error.message);
    else setMensagem("Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <span className="brand-mark"><Sparkles size={20} /></span>
        <h1>Vamos recuperar seu acesso</h1>
        <p>Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>
        <form onSubmit={enviar}>
          <label className="form-field">E-mail<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" /></label>
          {erro && <div role="alert" className="alert alert-error">{erro}</div>}
          {mensagem && <div role="status" className="alert alert-success">{mensagem}</div>}
          <button className="button button-primary" disabled={carregando}>{carregando ? <LoaderCircle size={17} className="animate-spin" /> : null} Enviar link</button>
        </form>
        <p className="auth-switch"><Link href="/login"><ArrowLeft size={13} style={{ verticalAlign: "middle" }} /> Voltar para entrar</Link></p>
      </section>
    </main>
  );
}
