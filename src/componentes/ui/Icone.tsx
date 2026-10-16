import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardList,
  ClipboardPen,
  Clock,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  HardHat,
  History,
  Hourglass,
  Info,
  LayoutGrid,
  Lock,
  Mail,
  Menu,
  Paperclip,
  ReceiptText,
  Send,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

const icones = {
  "calendario-intervalo": CalendarRange,
  calendario: CalendarDays,
  relogio: Clock,
  prancheta: ClipboardList,
  pessoa: BriefcaseBusiness,
  predios: Building2,
  sino: BellRing,
  historico: History,
  anexo: Paperclip,
  ordem: ClipboardPen,
  cotacao: ReceiptText,
  relatorio: ChartColumn,
  carteira: LayoutGrid,
  check: Check,
  "check-circulo": CircleCheck,
  alerta: TriangleAlert,
  info: Info,
  seta: ArrowRight,
  menu: Menu,
  fechar: X,
  email: Mail,
  copiar: Copy,
  cadeado: Lock,
  chevron: ChevronDown,
  externo: ExternalLink,
  enviar: Send,
  planilha: FileSpreadsheet,
  capacete: HardHat,
  ampulheta: Hourglass,
} satisfies Record<string, LucideIcon>;

export type NomeIcone = keyof typeof icones;

interface PropsIcone {
  nome: NomeIcone;
  className?: string;
  tamanho?: number;
  espessura?: number;
}

/** Ícone decorativo (escondido de leitores de tela). O texto ao lado diz o que ele significa. */
export function Icone({ nome, className, tamanho = 20, espessura = 1.75 }: PropsIcone) {
  const Componente = icones[nome];
  return (
    <Componente
      aria-hidden="true"
      focusable="false"
      width={tamanho}
      height={tamanho}
      strokeWidth={espessura}
      className={className}
    />
  );
}
