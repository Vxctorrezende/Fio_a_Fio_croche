export type PerfilPapel = "cliente" | "admin";

export type Produto = {
  id: string;
  nome: string;
  valor: number;
  imagem_url: string | null;
  criado_em: string;
};

export type Perfil = {
  id: string;
  papel: PerfilPapel;
};
