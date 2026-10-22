import { guardar, ler } from "./armazenamento";

const CHAVE_DO_SOM = "venus.somDaVeninha";
const TOM_BASE = 520;
const PASSO_DO_TOM = 50;
const TONS_DIFERENTES = 6;
const QUEDA_DO_TOM = 0.6;
const DURACAO = 0.07;
const SUBIDA = 0.01;
const VOLUME = 0.45;
const SILENCIO = 0.0001;

let contexto: AudioContext | null = null;

function ehBooleano(valor: unknown): valor is boolean {
  return typeof valor === "boolean";
}

export function lerSomLigado(): boolean {
  return ler(CHAVE_DO_SOM, ehBooleano) ?? true;
}

export function guardarSomLigado(ligado: boolean): void {
  guardar(CHAVE_DO_SOM, ligado);
}

function contextoDeAudio(): AudioContext | null {
  if (contexto === null && typeof AudioContext !== "undefined") {
    contexto = new AudioContext();
  }

  return contexto;
}

function tomDaLetra(letra: string): number {
  const codigo = letra.toLowerCase().charCodeAt(0);
  const variacao = Number.isNaN(codigo) ? 0 : codigo % TONS_DIFERENTES;

  return TOM_BASE + variacao * PASSO_DO_TOM;
}

export function tocarPop(letra: string): void {
  try {
    const audio = contextoDeAudio();

    if (audio === null) {
      return;
    }

    if (audio.state === "suspended") {
      audio.resume().catch(() => undefined);
    }

    const agora = audio.currentTime;
    const tom = tomDaLetra(letra);
    const oscilador = audio.createOscillator();
    const volume = audio.createGain();

    oscilador.type = "triangle";
    oscilador.frequency.setValueAtTime(tom, agora);
    oscilador.frequency.exponentialRampToValueAtTime(
      tom * QUEDA_DO_TOM,
      agora + DURACAO,
    );

    volume.gain.setValueAtTime(SILENCIO, agora);
    volume.gain.exponentialRampToValueAtTime(VOLUME, agora + SUBIDA);
    volume.gain.exponentialRampToValueAtTime(SILENCIO, agora + DURACAO);

    oscilador.connect(volume);
    volume.connect(audio.destination);
    oscilador.start(agora);
    oscilador.stop(agora + DURACAO);
  } catch {
    return;
  }
}
