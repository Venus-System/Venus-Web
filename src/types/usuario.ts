import type { Auditavel } from './comum';

export type Genero = 'female' | 'male' | 'non_binary' | 'prefer_not_say';

export type FaixaEtaria =
  | 'under_18'
  | 'from_18_to_24'
  | 'from_25_to_34'
  | 'from_35_to_44'
  | 'from_45_to_54'
  | 'from_55_plus';

export type TipoPele = 'dry' | 'oily' | 'combination' | 'normal' | 'other';

export type Sensibilidade = 'low' | 'medium' | 'high' | 'very_high';

export type TipoCabelo = 'straight' | 'wavy' | 'curly' | 'coily' | 'other';

export type TipoCouroCabeludo = 'dry' | 'oily' | 'normal' | 'sensitive' | 'other';

export type Fototipo = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export interface Usuario extends Auditavel {
  usuarioId: number;
  nome: string;
  email: string;
  ativo: boolean;
}

export interface PerfilUsuario extends Auditavel {
  perfilId: number;
  usuarioId: number;
  genero: Genero;
  faixaEtaria: FaixaEtaria;
  tipoPele: TipoPele;
  sensibilidade: Sensibilidade;
  tipoCabelo: TipoCabelo;
  tipoCouroCabeludo: TipoCouroCabeludo;
  fototipo: Fototipo;
  propensaoAcne: boolean;
  temRosacea: boolean;
  temEczema: boolean;
  temMelasma: boolean;
  temHiperpigmentacao: boolean;
  gestante: boolean;
}

export interface PreferenciasUsuario extends Auditavel {
  preferenciaId: number;
  usuarioId: number;
  preferCrueltyFree: boolean;
  preferVegano: boolean;
  preferSustentavel: boolean;
  preferSemFragrancia: boolean;
  preferSemParabenos: boolean;
  preferSemSulfatos: boolean;
  preferSemSilicones: boolean;
}

export interface Alergia extends Auditavel {
  alergiaId: number;
  nome: string;
  descricao: string;
}

export interface AlergiaDoUsuario extends Auditavel {
  usuarioAlergiaId: number;
  usuarioId: number;
  alergiaId: number;
  alergia?: Alergia;
}

export type CategoriaTag = 'skin' | 'hair' | 'health' | 'values';

export interface TagPerfil extends Auditavel {
  tagId: number;
  nome: string;
  categoria: CategoriaTag;
  descricao: string;
}

export interface TagDoUsuario extends Auditavel {
  usuarioTagId: number;
  usuarioId: number;
  tagId: number;
  tag?: TagPerfil;
}

export interface PerfilCompleto {
  usuario: Usuario;
  perfil: PerfilUsuario;
  preferencias: PreferenciasUsuario;
  alergias: Alergia[];
  tags: TagPerfil[];
  completude: number;
}
