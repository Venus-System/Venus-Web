import type { Envios } from "../../types/envio";
import { serumCalmanteAveia } from "./produtos";

const UMA_HORA = 60 * 60 * 1000;

function horasAtras(horas: number): string {
  return new Date(Date.now() - horas * UMA_HORA).toISOString();
}

export function enviosDoMock(): Envios {
  return {
    listAvailable: true,
    submissions: [
      {
        id: "envio-bruma",
        name: "Bruma Facial de Rosas",
        brandName: "Flora Nativa",
        photoUrl: null,
        submittedAt: horasAtras(3),
        status: "in_review",
        decidedAt: null,
        rejectionReason: null,
        productSlug: null,
      },
      {
        id: "envio-sem-nome",
        name: null,
        brandName: null,
        photoUrl: null,
        submittedAt: horasAtras(30),
        status: "in_review",
        decidedAt: null,
        rejectionReason: null,
        productSlug: null,
      },
      {
        id: "envio-shampoo",
        name: "Shampoo Sólido de Argila",
        brandName: "Raiz Viva",
        photoUrl: null,
        submittedAt: horasAtras(96),
        status: "approved",
        decidedAt: horasAtras(50),
        rejectionReason: null,
        productSlug: null,
      },
      {
        id: "envio-creme-maos",
        name: "Creme para Mãos de Karité",
        brandName: "Purebase",
        photoUrl: null,
        submittedAt: horasAtras(170),
        status: "rejected",
        decidedAt: horasAtras(150),
        rejectionReason:
          "Foto ilegível ou cortada. A lista de ingredientes ficou fora da foto do verso. Tente de novo mostrando o rótulo inteiro.",
        productSlug: null,
      },
      {
        id: "envio-serum",
        name: serumCalmanteAveia.name,
        brandName: serumCalmanteAveia.brand.name,
        photoUrl: serumCalmanteAveia.imageUrl,
        submittedAt: horasAtras(240),
        status: "published",
        decidedAt: horasAtras(200),
        rejectionReason: null,
        productSlug: serumCalmanteAveia.slug,
      },
    ],
  };
}
