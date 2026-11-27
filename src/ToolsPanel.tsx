import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { Lang } from "./i18n";
import {
  GEAR_SOURCES,
  buildDofCsv,
  loadNamedSetups,
  storeNamedSetups,
  type NamedSetup,
} from "./toolbox";

export type Snapshot = {
  distanceMm: number;
  focalMm: number;
  aperture: number;
  sensor: string;
  nearMm: number;
  farMm: number;
  totalMm: number;
};

type ToolsText = {
  share: string;
  copied: string;
  png: string;
  csv: string;
  namedTitle: string;
  namePlaceholder: string;
  save: string;
  load: string;
  remove: string;
  noSaves: string;
  compareTitle: string;
  setA: string;
  clearA: string;
  noA: string;
  now: string;
  distance: string;
  focal: string;
  aperture: string;
  near: string;
  far: string;
  total: string;
  infinity: string;
  unknownName: string;
  gearSource: string;
  gearChecked: string;
  gearEmpty: string;
};

const EN: ToolsText = {
  share: "Copy share link",
  copied: "Copied",
  png: "Export monitor PNG",
  csv: "Export DoF table (CSV)",
  namedTitle: "Saved setups",
  namePlaceholder: "Setup name",
  save: "Save",
  load: "Load",
  remove: "Delete",
  noSaves: "No saved setups yet.",
  compareTitle: "Compare",
  setA: "Set current as A",
  clearA: "Clear A",
  noA: "Set setup A, then change the settings to compare.",
  now: "Current",
  distance: "Distance",
  focal: "Focal",
  aperture: "Aperture",
  near: "Near",
  far: "Far",
  total: "Total",
  infinity: "∞",
  unknownName: "Untitled",
  gearSource: "Source",
  gearChecked: "checked",
  gearEmpty: "Source address and check date not added yet.",
};

const TR: ToolsText = {
  share: "Paylaşım bağlantısını kopyala",
  copied: "Kopyalandı",
  png: "Monitör görüntüsünü PNG indir",
  csv: "DoF tablosunu CSV indir",
  namedTitle: "Kayıtlı kurulumlar",
  namePlaceholder: "Kurulum adı",
  save: "Kaydet",
  load: "Yükle",
  remove: "Sil",
  noSaves: "Henüz kayıtlı kurulum yok.",
  compareTitle: "Karşılaştır",
  setA: "Mevcut kurulumu A yap",
  clearA: "A'yı temizle",
  noA: "Önce A kurulumunu kaydet, sonra ayarları değiştirip karşılaştır.",
  now: "Şimdi",
  distance: "Mesafe",
  focal: "Odak",
  aperture: "Diyafram",
  near: "Yakın",
  far: "Uzak",
  total: "Toplam",
  infinity: "∞",
  unknownName: "Adsız",
  gearSource: "Kaynak",
  gearChecked: "kontrol",
  gearEmpty: "Kaynak adresi ve kontrol tarihi henüz eklenmedi.",
};

function textFor(lang: Lang): ToolsText {
  return lang === "tr" ? TR : EN;
}

function formatM(mm: number, inf: string) {
  return mm === Infinity ? inf : `${(mm / 1000).toFixed(2)} m`;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Renders the monitor SVG (marked with data-monitor-svg) to a 3x PNG.
function exportMonitorPng(name: string) {
  const svg = document.querySelector("[data-monitor-svg] svg") as SVGSVGElement | null;
  if (!svg) return;
  const vb = svg.viewBox.baseVal;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(vb.width));
  clone.setAttribute("height", String(vb.height));
  const xml = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  const img = new Image();
  img.onload = () => {
    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = vb.width * scale;
    canvas.height = vb.height * scale;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => b && download(b, name), "image/png");
    }
    URL.revokeObjectURL(svgUrl);
  };
  img.src = svgUrl;
}

type Props = {
  lang: Lang;
  current: Snapshot;
  cocMm: number;
  snapshot: Snapshot | null;
  onSnapshot: (s: Snapshot | null) => void;
  query: string; // serialized current setup, e.g. "?d=72&f=50..."
  onApplyQuery: (query: string) => void;
  gearId: string; // selected camera id, "" when none
};

export default function ToolsPanel({
  lang,
  current,
  cocMm,
  snapshot,
  onSnapshot,
  query,
  onApplyQuery,
  gearId,
}: Props) {
  const gearSource = gearId ? GEAR_SOURCES[gearId] : undefined;
  const tx = textFor(lang);
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const [copied, setCopied] = useState(false);
  const [named, setNamed] = useState<NamedSetup[]>(loadNamedSetups);
  const [nameDraft, setNameDraft] = useState("");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the URL bar still holds the link.
    }
  };

  const saveNamed = () => {
    const next = [...named, { name: nameDraft.trim() || tx.unknownName, query }];
    setNamed(next);
    storeNamedSetups(next);
    setNameDraft("");
  };

  const removeNamed = (index: number) => {
    const next = named.filter((_, i) => i !== index);
    setNamed(next);
    storeNamedSetups(next);
  };

  const exportCsv = () => {
    const csv = buildDofCsv(current.focalMm, current.aperture, cocMm);
    download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), "dof-tablo.csv");
  };

  const rowCell = (value: string) => (
    <Text fontSize="sm" textAlign="center">{value}</Text>
  );

  const cmpRow = (label: string, s: Snapshot) => (
    <SimpleGrid key={label} columns={4} spacing={2} alignItems="center">
      <Text fontSize="xs" color={mutedText}>{label}</Text>
      {rowCell(formatM(s.distanceMm, tx.infinity))}
      {rowCell(`${s.focalMm.toFixed(1)} mm · f/${s.aperture.toFixed(1)}`)}
      {rowCell(`${formatM(s.nearMm, tx.infinity)} – ${formatM(s.farMm, tx.infinity)}`)}
    </SimpleGrid>
  );

  return (
    <Box>
      <Flex gap={2} wrap="wrap">
        <Button size="sm" variant="outline" onClick={copyLink}>
          {copied ? tx.copied : tx.share}
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportMonitorPng("monitor.png")}>
          {tx.png}
        </Button>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          {tx.csv}
        </Button>
      </Flex>

      {gearId && (
        <Text fontSize="xs" color={mutedText} mt={3}>
          {gearSource
            ? `${tx.gearSource}: ${gearSource.address} · ${tx.gearChecked}: ${gearSource.checkedOn}`
            : tx.gearEmpty}
        </Text>
      )}

      <Box mt={4} bg={cardBg} border="1px" borderColor={borderColor} rounded="lg" p={3}>
        <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wider" mb={2}>
          {tx.namedTitle}
        </Text>
        <Flex gap={2} mb={2}>
          <Input
            size="sm"
            placeholder={tx.namePlaceholder}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
          />
          <Button size="sm" onClick={saveNamed}>{tx.save}</Button>
        </Flex>
        {named.length === 0 ? (
          <Text fontSize="sm" color={mutedText}>{tx.noSaves}</Text>
        ) : (
          named.map((item, i) => (
            <Flex key={`${item.name}-${i}`} justify="space-between" align="center" py={1}>
              <Text fontSize="sm">{item.name}</Text>
              <Flex gap={1}>
                <Button size="xs" variant="outline" onClick={() => onApplyQuery(item.query)}>{tx.load}</Button>
                <Button size="xs" variant="ghost" onClick={() => removeNamed(i)}>{tx.remove}</Button>
              </Flex>
            </Flex>
          ))
        )}
      </Box>

      <Box mt={4} bg={cardBg} border="1px" borderColor={borderColor} rounded="lg" p={3}>
        <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wider" mb={2}>
          {tx.compareTitle}
        </Text>
        <Flex gap={2} mb={2}>
          <Button size="sm" onClick={() => onSnapshot(current)}>{tx.setA}</Button>
          {snapshot && (
            <Button size="sm" variant="ghost" onClick={() => onSnapshot(null)}>{tx.clearA}</Button>
          )}
        </Flex>
        {snapshot ? (
          <Box>
            <SimpleGrid columns={4} spacing={2} mb={1}>
              <Text fontSize="xs" color={mutedText}> </Text>
              <Text fontSize="xs" color={mutedText} textAlign="center">{tx.distance}</Text>
              <Text fontSize="xs" color={mutedText} textAlign="center">{tx.focal} · {tx.aperture}</Text>
              <Text fontSize="xs" color={mutedText} textAlign="center">{tx.near} – {tx.far}</Text>
            </SimpleGrid>
            {cmpRow("A", snapshot)}
            {cmpRow(tx.now, current)}
          </Box>
        ) : (
          <Text fontSize="sm" color={mutedText}>{tx.noA}</Text>
        )}
      </Box>
    </Box>
  );
}

// Mobile: collapsible card. Desktop (lg+): always open, header shown as plain text.
export function FoldCard({
  title,
  children,
  mt = 0,
}: {
  title: string;
  children: React.ReactNode;
  mt?: number;
}) {
  const [open, setOpen] = useState(false);
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headerStyle = {
    fontSize: "xs",
    fontWeight: "semibold",
    color: mutedText,
    textTransform: "uppercase" as const,
    letterSpacing: "wider",
  };
  return (
    <Box mt={mt} bg={cardBg} border="1px" borderColor={borderColor} rounded="lg" p={3}>
      <Button
        display={{ base: "flex", lg: "none" }}
        w="100%"
        justifyContent="space-between"
        variant="ghost"
        size="sm"
        px={0}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Text {...headerStyle}>{title}</Text>
        <Text fontSize="xs">{open ? "▴" : "▾"}</Text>
      </Button>
      <Text display={{ base: "none", lg: "block" }} mb={2} {...headerStyle}>{title}</Text>
      <Box display={{ base: open ? "block" : "none", lg: "block" }}>{children}</Box>
    </Box>
  );
}
