import {
  browserLocalPersistence,
  browserSessionPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  getAdditionalUserInfo,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { autenticacaoFirebase } from "../config/firebase";
import { simularLatencia } from "./mocks/atraso";
import type { Usuario } from "../types/usuario";
import { validarEmail, validarNome, validarSenha } from "../utils/validacao";
import { criarUsuarioNaApi } from "./api/usuarios";

function paraUsuario(conta: User): Usuario {
  const email = conta.email ?? "";

  return {
    id: conta.uid,
    name: conta.displayName ?? email.split("@")[0],
    email,
  };
}

async function aplicarPersistencia(continuarConectado: boolean): Promise<void> {
  if (autenticacaoFirebase === null) {
    return;
  }

  await setPersistence(
    autenticacaoFirebase,
    continuarConectado ? browserLocalPersistence : browserSessionPersistence,
  );
}

const CHAVE_SESSAO = "venus.sessao";

function ehUsuario(valor: unknown): valor is Usuario {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "string" &&
    "name" in valor &&
    typeof valor.name === "string" &&
    "email" in valor &&
    typeof valor.email === "string"
  );
}

export async function entrar(
  email: string,
  senha: string,
  continuarConectado: boolean,
): Promise<Usuario> {
  if (autenticacaoFirebase === null) {
    return entrarComMock(email, senha, continuarConectado);
  }

  await aplicarPersistencia(continuarConectado);

  const credencial = await signInWithEmailAndPassword(
    autenticacaoFirebase,
    email,
    senha,
  );

  return paraUsuario(credencial.user);
}

export async function entrarComGoogle(
  continuarConectado: boolean,
): Promise<Usuario> {
  if (autenticacaoFirebase === null) {
    throw new Error("A entrada com Google não está configurada.");
  }

  await aplicarPersistencia(continuarConectado);

  const provedor = new GoogleAuthProvider();
  const credencial = await signInWithPopup(autenticacaoFirebase, provedor);
  const usuario = paraUsuario(credencial.user);
  const informacoes = getAdditionalUserInfo(credencial);

  if (informacoes?.isNewUser === true) {
    try {
      await criarUsuarioNaApi(usuario);
    } catch {
      return usuario;
    }
  }

  return usuario;
}

async function entrarComMock(
  email: string,
  senha: string,
  continuarConectado: boolean,
): Promise<Usuario> {
  await simularLatencia();

  if (validarEmail(email) !== null || senha.length < 8) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const usuario: Usuario = {
    id: "usuario-mock",
    name: email.split("@")[0],
    email,
  };

  gravarSessao(usuario, continuarConectado);

  return usuario;
}

export async function sair(): Promise<void> {
  if (autenticacaoFirebase === null) {
    sairDoMock();
    return;
  }

  await signOut(autenticacaoFirebase);
}

function sairDoMock(): void {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
  } catch {
    return;
  }
}

export function observarSessao(
  aoMudar: (usuario: Usuario | null) => void,
): () => void {
  if (autenticacaoFirebase === null) {
    recuperarSessaoDoMock().then(aoMudar);
    return () => {};
  }

  return onAuthStateChanged(autenticacaoFirebase, (conta) => {
    aoMudar(conta === null ? null : paraUsuario(conta));
  });
}

async function recuperarSessaoDoMock(): Promise<Usuario | null> {
  const salvo = lerDoArmazenamento();

  if (salvo === null) {
    return null;
  }

  try {
    const dados: unknown = JSON.parse(salvo);
    return ehUsuario(dados) ? dados : null;
  } catch {
    return null;
  }
}

function ehUsuarioInexistente(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    erro.code === "auth/user-not-found"
  );
}

export async function solicitarRedefinicao(email: string): Promise<void> {
  if (autenticacaoFirebase === null) {
    await simularLatencia();
    return;
  }

  try {
    await sendPasswordResetEmail(autenticacaoFirebase, email);
  } catch (erro) {
    if (ehUsuarioInexistente(erro)) {
      return;
    }

    throw erro;
  }
}

export async function confirmarRedefinicao(
  codigo: string,
  senha: string,
): Promise<void> {
  if (autenticacaoFirebase === null) {
    await simularLatencia();
    return;
  }

  await confirmPasswordReset(autenticacaoFirebase, codigo, senha);
}

export async function criarConta(
  nome: string,
  email: string,
  senha: string,
): Promise<Usuario> {
  if (autenticacaoFirebase === null) {
    return criarContaComMock(nome, email, senha);
  }

  const credencial = await createUserWithEmailAndPassword(
    autenticacaoFirebase,
    email,
    senha,
  );

  await updateProfile(credencial.user, { displayName: nome.trim() });
  await aplicarPersistencia(false);

  const usuario: Usuario = {
    ...paraUsuario(credencial.user),
    name: nome.trim(),
  };

  try {
    await criarUsuarioNaApi(usuario);
  } catch {
    return usuario;
  }

  return usuario;
}

async function criarContaComMock(
  nome: string,
  email: string,
  senha: string,
): Promise<Usuario> {
  await simularLatencia();

  if (
    validarNome(nome) !== null ||
    validarEmail(email) !== null ||
    validarSenha(senha) !== null
  ) {
    throw new Error("Não foi possível criar a conta com esses dados.");
  }

  const usuario: Usuario = {
    id: crypto.randomUUID(),
    name: nome.trim(),
    email,
  };

  gravarSessao(usuario, false);

  return usuario;
}

function lerDoArmazenamento(): string | null {
  try {
    return (
      localStorage.getItem(CHAVE_SESSAO) ?? sessionStorage.getItem(CHAVE_SESSAO)
    );
  } catch {
    return null;
  }
}

function gravarSessao(usuario: Usuario, persistente: boolean): void {
  try {
    const destino = persistente ? localStorage : sessionStorage;

    destino.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
  } catch {
    return;
  }
}
