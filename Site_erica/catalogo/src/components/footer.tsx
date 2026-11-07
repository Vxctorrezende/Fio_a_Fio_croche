import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>Feito à mão, com carinho em cada ponto · <a href="https://www.instagram.com/fio.a.fio.crochee/" target="_blank" rel="noreferrer"><Instagram size={13} style={{ verticalAlign: "middle" }} /> @fio.a.fio.crochee</a></div>
      <div style={{ marginTop: 6 }}>© {new Date().getFullYear()} Fio a Fio Crochê</div>
    </footer>
  );
}
