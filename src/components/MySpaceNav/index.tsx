import SegmentedNav from "../SegmentedNav";
import type { SegmentedNavItem } from "../SegmentedNav";

const ABAS: SegmentedNavItem[] = [
  { to: "/historico", label: "Histórico", end: true },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/historico/enviados", label: "Enviados" },
];

function MySpaceNav() {
  return <SegmentedNav label="Meu espaço" items={ABAS} />;
}

export default MySpaceNav;
