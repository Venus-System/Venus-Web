export interface ProdutoBaseApi {
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

export interface AlergiaApi {
  id: number;
  allergyName: string;
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
  overallScore: number | null;
  healthScore: number | null;
  environmentalScore: number | null;
  ethicalScore: number | null;
  performanceScore: number | null;
  transparencyScore: number | null;
  confidenceScore: number | null;
}

export interface VersaoApi {
  id: number;
}

export interface ProductFullResponse {
  product: ProdutoBaseApi;
  brand: MarcaApi;
  category: CategoriaApi;
  currentVersion: VersaoApi | null;
  claims: ClaimApi[];
  score: NotasApi | null;
}

export interface ProdutoApi extends ProdutoBaseApi {
  brandId: number;
  productCategoryId: number;
  isActive: boolean;
}
