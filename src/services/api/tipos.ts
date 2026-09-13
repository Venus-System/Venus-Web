export interface ProdutoApi {
  id: number;
  name: string;
  description: string | null;
  slug: string;
}

export interface MarcaApi {
  id: number;
  name: string;
  country: string | null;
  website: string | null;
  hasCrueltyFreeClaim: boolean;
  hasVeganClaim: boolean;
  isBrazilian: boolean;
}

export interface CategoriaApi {
  id: number;
  name: string;
}

export interface ClaimApi {
  claim: {
    name: string;
    claimType: string;
  };
  wasVerified: boolean;
}

export interface NotasApi {
  overallScore: number;
  healthScore: number;
  environmentalScore: number;
  ethicalScore: number;
  performanceScore: number;
  transparencyScore: number;
  confidenceScore: number;
}

export interface ProductFullResponse {
  product: ProdutoApi;
  brand: MarcaApi;
  category: CategoriaApi;
  claims: ClaimApi[];
  score: NotasApi | null;
}

export interface ProdutoApi {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  brandId: number;
  productCategoryId: number;
  isActive: boolean;
}
