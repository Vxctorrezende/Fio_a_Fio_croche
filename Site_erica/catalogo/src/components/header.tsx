"use client";

import Link from "next/link";
import { Instagram, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user);
      if (data.user) {
        const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", data.user.id).maybeSingle();
        if (active) setAdmin(perfil?.papel === "admin");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAdmin(false);
      if (session?.user) {
        setTimeout(async () => {
          const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", session.user.id).maybeSingle();
          if (active) setAdmin(perfil?.papel === "admin");
        }, 0);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function sair() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      window.alert(`Não foi possível sair: ${error.message}`);
      return;
    }
    window.location.assign("/login");
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Fio a Fio Crochê, início">
          <img className="brand-logo" src="/logo.jpg" alt="" />
          <span><span className="brand-title">Fio a Fio Crochê</span><br /><span className="brand-subtitle">feito à mão, feito com amor</span></span>
        </Link>
        <nav className="header-actions">
          <a className="icon-link" href="https://www.instagram.com/fio.a.fio.crochee/" target="_blank" rel="noreferrer">
            <Instagram size={17} /><span>Instagram</span>
          </a>
          {user ? (
            <>
              {admin && <Link className="icon-link" href="/admin"><span>Gerenciar</span></Link>}
              <button className="icon-link" onClick={sair} aria-label="Sair"><LogOut size={17} /><span>Sair</span></button>
            </>
          ) : (
            <Link href="/login" className="button button-primary"><LogIn size={15} /> Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
