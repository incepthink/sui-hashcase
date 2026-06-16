"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

import "./page.css";
import { useCollections } from "@/hooks/useCollections";

type ParticipationSummary = {
  hasQuests?: boolean;
  hasBadges?: boolean;
  hasLoyalty?: boolean;
  hasUnlockables?: boolean;
  hasLocationBasedNfts?: boolean;
  mintTypes?: string[];
  activeMintCount?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  hasFreeMint?: boolean;
  hasPaidMint?: boolean;
};

type SearchSummary = {
  metadata?: string[];
  quests?: string[];
};

type CollectionCard = {
  id?: number;
  collection_id?: number;
  name?: string;
  description?: string;
  image_uri?: string;
  chain_name?: string;
  chainType?: string;
  collection_type?: string | null;
  tags?: string[] | string | null;
  collection_address?: string;
  contract_address?: string;
  address?: string;
  cap_id?: string | null;
  package_id?: string | null;
  contract?: {
    contract_address?: string;
    Chain?: {
      chain_name?: string;
      chain_type?: string;
    };
  };
  participation?: ParticipationSummary;
  search_summary?: SearchSummary;
  createdAt?: string;
  updatedAt?: string;
};

type FiltersState = {
  search: string;
  type: string;
  chains: string[];
  tags: string[];
  status: string;
  mintTypes: string[];
  hasQuests: boolean;
  hasLoyalty: boolean;
  hasBadges: boolean;
  hasUnlockables: boolean;
  hasLocationBasedNfts: boolean;
  price: string;
  sort: string;
};

const DEFAULT_FILTERS: FiltersState = {
  search: "",
  type: "all",
  chains: [],
  tags: [],
  status: "all",
  mintTypes: [],
  hasQuests: false,
  hasLoyalty: false,
  hasBadges: false,
  hasUnlockables: false,
  hasLocationBasedNfts: false,
  price: "all",
  sort: "recent",
};

const HIDDEN_COLLECTION_IDS = new Set([216, 219]);

const COLLECTION_TYPES = [
  { value: "all", label: "All types" },
  { value: "NFT", label: "NFT" },
  { value: "Event", label: "Event" },
  { value: "DaoOrg", label: "DAO / Org" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All participation" },
  { value: "active", label: "Active" },
  { value: "claimable", label: "Mintable" },
  { value: "quests", label: "Has quests" },
  { value: "unavailable", label: "No active actions" },
];

const MINT_TYPE_OPTIONS = [
  { value: "free", label: "Free mint" },
  { value: "paid", label: "Paid mint" },
  { value: "randomized", label: "Randomized" },
  { value: "upgradable", label: "Upgradable" },
];

const PRICE_OPTIONS = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free only" },
  { value: "paid", label: "Paid only" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently added" },
  { value: "name", label: "Name A-Z" },
  { value: "participation", label: "Most active participation" },
];

const normalizeList = (value: string[] | string | null | undefined) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
  } catch {
    // Fall back to comma-separated values below.
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeToken = (value: string | null | undefined) =>
  String(value || "").trim();

const chainLabel = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getContractAddress = (collection: CollectionCard) => {
  let contractAddress =
    collection.contract?.contract_address ||
    collection.contract_address ||
    collection.collection_address ||
    collection.address ||
    "";

  const oldPackage =
    "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";
  const newCollection =
    "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";
  const dbCollection =
    "0x6c7ff54132f7693ad1334e85ff7c5cf2f967b37cc785e51019c42b42a5c38b6f";

  if (contractAddress === oldPackage || contractAddress === dbCollection) {
    contractAddress = newCollection;
  }

  return contractAddress;
};

const hasActiveParticipation = (participation?: ParticipationSummary) =>
  Boolean(
    participation?.activeMintCount ||
      participation?.hasQuests ||
      participation?.hasBadges ||
      participation?.hasLoyalty
  );

const hasPointsParticipation = (collection: CollectionCard) => {
  const participation = collection.participation || {};
  const tags = normalizeList(collection.tags).map((tag) => tag.toLowerCase());
  const searchText = [
    collection.name,
    collection.description,
    ...(collection.search_summary?.metadata || []),
    ...(collection.search_summary?.quests || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return Boolean(
    participation.hasLoyalty ||
      tags.includes("points") ||
      searchText.includes("loyalty") ||
      searchText.includes("points")
  );
};

const hasMintAvailability = (
  participation: ParticipationSummary,
  mintType: string
) =>
  Boolean(
    participation.mintTypes?.includes(mintType) ||
      (mintType === "free" && participation.hasFreeMint) ||
      (mintType === "paid" && participation.hasPaidMint)
  );

const participationScore = (participation?: ParticipationSummary) => {
  if (!participation) return 0;
  return (
    (participation.activeMintCount || 0) +
    (participation.hasQuests ? 3 : 0) +
    (participation.hasLoyalty ? 2 : 0) +
    (participation.hasBadges ? 1 : 0) +
    (participation.hasUnlockables ? 1 : 0)
  );
};

const matchesSearch = (collection: CollectionCard, search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const searchable = [
    collection.name,
    collection.description,
    collection.chain_name,
    collection.chainType,
    collection.collection_type,
    getContractAddress(collection),
    collection.package_id,
    collection.cap_id,
    ...normalizeList(collection.tags),
    ...(collection.search_summary?.metadata || []),
    ...(collection.search_summary?.quests || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
};

const countActiveFilters = (filters: FiltersState) =>
  [
    filters.type !== "all",
    filters.chains.length,
    filters.tags.length,
    filters.status !== "all",
    filters.mintTypes.length,
    filters.hasQuests,
    filters.hasLoyalty,
    filters.hasBadges,
    filters.hasUnlockables,
    filters.hasLocationBasedNfts,
    filters.price !== "all",
  ].filter(Boolean).length;

const HeaderSection = () => (
  <div className="relative w-full pt-14 pb-8">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Collections
        </h1>
        <p className="text-white/70 text-base md:text-lg">
          Find collections by chain, type, quests, loyalty, mint format, and
          active participation.
        </p>
      </div>
    </div>
  </div>
);

const getChainIcon = (chain: string) => {
  const normalized = chain.toLowerCase();
  if (normalized.includes("base")) return "/baselogo.png";
  if (normalized.includes("sui")) return "/suilogo.jpeg";
  return null;
};

const FilterSection = ({
  title,
  children,
  isOpen,
  onToggle,
  activeCount = 0,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  activeCount?: number;
}) => (
  <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 py-1 text-left"
      aria-expanded={isOpen}
    >
      <span className="flex items-center gap-2 text-[0.95rem] font-semibold text-white">
        {title}
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4DA2FF] px-1.5 text-[0.68rem] font-bold text-black">
            {activeCount}
          </span>
        )}
      </span>
      <ChevronDown
        className={`h-4 w-4 text-white/60 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    {isOpen && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
  </div>
);

const SelectControl = ({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
}) => (
  <label className="block">
    <span className="sr-only">{label}</span>
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 pr-9 text-sm text-white outline-none transition focus:border-[#4DA2FF] focus:ring-2 focus:ring-[#4DA2FF]/25"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#071034]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
    </span>
  </label>
);

const PillOption = ({
  label,
  checked,
  onChange,
  iconSrc,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  iconSrc?: string | null;
}) => (
  <button
    type="button"
    onClick={onChange}
    aria-pressed={checked}
    className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/30 ${
      checked
        ? "border-[#4DA2FF] bg-[#4DA2FF] text-white shadow-[0_0_0_1px_rgba(77,162,255,0.20)]"
        : "border-white/15 bg-[#0d1117] text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
    }`}
  >
    {iconSrc && (
      <span className="relative h-4 w-4 overflow-hidden rounded-full bg-white">
        <Image src={iconSrc} alt="" fill sizes="16px" className="object-cover" />
      </span>
    )}
    {checked && !iconSrc && <Check className="h-3.5 w-3.5" />}
    <span>{label}</span>
  </button>
);

const ToggleOption = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    aria-pressed={checked}
    className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/30 ${
      checked
        ? "border-[#4DA2FF] bg-[#4DA2FF] text-white"
        : "border-white/15 bg-[#0d1117] text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
    }`}
  >
    <span>{label}</span>
    {checked && <Check className="h-3.5 w-3.5" />}
  </button>
);

const FiltersPanel = ({
  filters,
  chainOptions,
  tagOptions,
  onChange,
}: {
  filters: FiltersState;
  chainOptions: string[];
  tagOptions: string[];
  onChange: (next: Partial<FiltersState>) => void;
}) => {
  const [openSections, setOpenSections] = useState({
    type: true,
    categories: true,
    chain: true,
    participation: true,
  });
  const toggleFromList = (
    key: "chains" | "tags" | "mintTypes",
    value: string
  ) => {
    const current = filters[key];
    onChange({
      [key]: current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    } as Partial<FiltersState>);
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const participationActiveCount = [
    filters.status !== "all",
    filters.mintTypes.length,
    filters.hasQuests,
    filters.hasLoyalty,
    filters.hasBadges,
    filters.hasUnlockables,
    filters.hasLocationBasedNfts,
    filters.price !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <FilterSection
        title="Collection Type"
        isOpen={openSections.type}
        onToggle={() => toggleSection("type")}
        activeCount={filters.type !== "all" ? 1 : 0}
      >
        {COLLECTION_TYPES.map((type) => (
          <PillOption
            key={type.value}
            label={type.label}
            checked={filters.type === type.value}
            onChange={() => onChange({ type: type.value })}
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Categories"
        isOpen={openSections.categories}
        onToggle={() => toggleSection("categories")}
        activeCount={filters.tags.length}
      >
        {tagOptions.map((tag) => (
          <PillOption
            key={tag}
            label={tag}
            checked={filters.tags.includes(tag)}
            onChange={() => toggleFromList("tags", tag)}
          />
        ))}
        {tagOptions.length === 0 && (
          <p className="text-sm text-white/45">No categories yet</p>
        )}
      </FilterSection>

      <FilterSection
        title="Chain"
        isOpen={openSections.chain}
        onToggle={() => toggleSection("chain")}
        activeCount={filters.chains.length}
      >
        {chainOptions.map((chain) => (
          <PillOption
            key={chain}
            label={chainLabel(chain)}
            checked={filters.chains.includes(chain)}
            iconSrc={getChainIcon(chain)}
            onChange={() => toggleFromList("chains", chain)}
          />
        ))}
        {chainOptions.length === 0 && (
          <p className="text-sm text-white/45">No chains yet</p>
        )}
      </FilterSection>

      <FilterSection
        title="Participation Mode"
        isOpen={openSections.participation}
        onToggle={() => toggleSection("participation")}
        activeCount={participationActiveCount}
      >
        {STATUS_OPTIONS.map((status) => (
          <PillOption
            key={status.value}
            label={status.label}
            checked={filters.status === status.value}
            onChange={() => onChange({ status: status.value })}
          />
        ))}
        {MINT_TYPE_OPTIONS.map((mintType) => (
          <PillOption
            key={mintType.value}
            label={mintType.label}
            checked={filters.mintTypes.includes(mintType.value)}
            onChange={() => toggleFromList("mintTypes", mintType.value)}
          />
        ))}
        <ToggleOption
          label="Has quests"
          checked={filters.hasQuests}
          onChange={() => onChange({ hasQuests: !filters.hasQuests })}
        />
        <ToggleOption
          label="Has loyalty / points"
          checked={filters.hasLoyalty}
          onChange={() => onChange({ hasLoyalty: !filters.hasLoyalty })}
        />
        <ToggleOption
          label="Has badges"
          checked={filters.hasBadges}
          onChange={() => onChange({ hasBadges: !filters.hasBadges })}
        />
        <ToggleOption
          label="Has unlockables"
          checked={filters.hasUnlockables}
          onChange={() =>
            onChange({ hasUnlockables: !filters.hasUnlockables })
          }
        />
        <ToggleOption
          label="Location based"
          checked={filters.hasLocationBasedNfts}
          onChange={() =>
            onChange({
              hasLocationBasedNfts: !filters.hasLocationBasedNfts,
            })
          }
        />
        {PRICE_OPTIONS.map((price) => (
          <PillOption
            key={price.value}
            label={price.label}
            checked={filters.price === price.value}
            onChange={() => onChange({ price: price.value })}
          />
        ))}
      </FilterSection>
    </div>
  );
};

const ActiveFilters = ({
  filters,
  onRemove,
  onClear,
}: {
  filters: FiltersState;
  onRemove: (next: Partial<FiltersState>) => void;
  onClear: () => void;
}) => {
  const chips = [
    filters.type !== "all"
      ? {
          label:
            COLLECTION_TYPES.find((option) => option.value === filters.type)
              ?.label || filters.type,
          clear: { type: "all" },
        }
      : null,
    ...filters.chains.map((chain) => ({
      label: chainLabel(chain),
      clear: { chains: filters.chains.filter((item) => item !== chain) },
    })),
    ...filters.tags.map((tag) => ({
      label: tag,
      clear: { tags: filters.tags.filter((item) => item !== tag) },
    })),
    filters.status !== "all"
      ? {
          label:
            STATUS_OPTIONS.find((option) => option.value === filters.status)
              ?.label || filters.status,
          clear: { status: "all" },
        }
      : null,
    ...filters.mintTypes.map((mintType) => ({
      label:
        MINT_TYPE_OPTIONS.find((option) => option.value === mintType)?.label ||
        mintType,
      clear: {
        mintTypes: filters.mintTypes.filter((item) => item !== mintType),
      },
    })),
    filters.hasQuests ? { label: "Has quests", clear: { hasQuests: false } } : null,
    filters.hasLoyalty
      ? { label: "Has loyalty", clear: { hasLoyalty: false } }
      : null,
    filters.hasBadges ? { label: "Has badges", clear: { hasBadges: false } } : null,
    filters.hasUnlockables
      ? { label: "Has unlockables", clear: { hasUnlockables: false } }
      : null,
    filters.hasLocationBasedNfts
      ? { label: "Location based", clear: { hasLocationBasedNfts: false } }
      : null,
    filters.price !== "all"
      ? {
          label:
            PRICE_OPTIONS.find((option) => option.value === filters.price)
              ?.label || filters.price,
          clear: { price: "all" },
        }
      : null,
  ].filter(Boolean) as { label: string; clear: Partial<FiltersState> }[];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => onRemove(chip.clear)}
            className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#4DA2FF]/35 bg-[#4DA2FF]/12 px-3 py-1.5 text-sm text-white transition hover:bg-[#4DA2FF]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/30"
          >
            <span>{chip.label}</span>
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 rounded-full px-2 py-1 text-sm font-semibold text-[#4DA2FF] transition hover:bg-[#4DA2FF]/10 hover:text-[#77B7FF]"
      >
        Clear all
      </button>
    </div>
  );
};

const NoFilteredResults = ({
  hasSearch,
  onClearSearch,
  onClearAll,
}: {
  hasSearch: boolean;
  onClearSearch: () => void;
  onClearAll: () => void;
}) => (
  <div className="rounded-xl border border-white/15 bg-white/8 px-6 py-14 text-center">
    <SlidersHorizontal className="mx-auto mb-4 h-10 w-10 text-[#4DA2FF]" />
    <h3 className="mb-2 text-xl font-semibold text-white">
      No collections match your filters
    </h3>
    <p className="mx-auto mb-6 max-w-md text-sm text-white/60">
      Try removing a category, mint type, or participation filter to broaden the
      results.
    </p>
    <div className="flex flex-wrap justify-center gap-3">
      {hasSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Clear search
        </button>
      )}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-lg bg-[#4DA2FF] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#77B7FF]"
      >
        Clear all filters
      </button>
    </div>
  </div>
);

const CollectionsPageContent: React.FC = () => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");

  const { data: dataold, isLoading, isError, error } = useCollections();
  const collections = useMemo(() => {
    const source = dataold?.collections ? [...dataold.collections] : [];
    return source
      .reverse()
      .filter(
        (collection: CollectionCard) =>
          !HIDDEN_COLLECTION_IDS.has(Number(collection.id))
      ) as CollectionCard[];
  }, [dataold?.collections]);

  const updateFilters = (next: Partial<FiltersState>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  };

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showMobileFilters]);

  const chainOptions = useMemo(
    () =>
      Array.from(
        new Set(
          collections
            .map((collection) =>
              normalizeToken(collection.chain_name || collection.chainType)
            )
            .filter(Boolean)
        )
      ).sort((a, b) => chainLabel(a).localeCompare(chainLabel(b))),
    [collections]
  );

  const tagOptions = useMemo(
    () =>
      Array.from(
        new Set(collections.flatMap((collection) => normalizeList(collection.tags)))
      ).sort((a, b) => a.localeCompare(b)),
    [collections]
  );

  const filteredCollections = useMemo(() => {
    const filtered = collections.filter((collection) => {
      const participation = collection.participation || {};
      const chain = normalizeToken(collection.chain_name || collection.chainType);
      const tags = normalizeList(collection.tags);

      if (!matchesSearch(collection, searchInput)) return false;
      if (filters.type !== "all" && collection.collection_type !== filters.type)
        return false;
      if (filters.chains.length && !filters.chains.includes(chain)) return false;
      if (
        filters.tags.length &&
        !filters.tags.some((tag) => tags.includes(tag))
      )
        return false;
      if (
        filters.mintTypes.length &&
        !filters.mintTypes.some((mintType) =>
          hasMintAvailability(participation, mintType)
        )
      )
        return false;
      if (filters.hasQuests && !participation.hasQuests) return false;
      if (filters.hasLoyalty && !hasPointsParticipation(collection)) return false;
      if (filters.hasBadges && !participation.hasBadges) return false;
      if (filters.hasUnlockables && !participation.hasUnlockables) return false;
      if (filters.hasLocationBasedNfts && !participation.hasLocationBasedNfts)
        return false;
      if (filters.price === "free" && !hasMintAvailability(participation, "free"))
        return false;
      if (filters.price === "paid" && !hasMintAvailability(participation, "paid"))
        return false;

      if (
        filters.status === "active" &&
        !hasActiveParticipation(participation) &&
        !hasPointsParticipation(collection)
      )
        return false;
      if (
        filters.status === "claimable" &&
        !(participation.activeMintCount && participation.activeMintCount > 0)
      )
        return false;
      if (filters.status === "quests" && !participation.hasQuests) return false;
      if (
        filters.status === "unavailable" &&
        (hasActiveParticipation(participation) || hasPointsParticipation(collection))
      )
        return false;

      return true;
    });

    return filtered.sort((a, b) => {
      if (filters.sort === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (filters.sort === "participation") {
        return (
          participationScore(b.participation) -
          participationScore(a.participation)
        );
      }
      return (
        new Date(b.createdAt || b.updatedAt || 0).getTime() -
        new Date(a.createdAt || a.updatedAt || 0).getTime()
      );
    });
  }, [collections, filters, searchInput]);

  const activeFilterCount = countActiveFilters(filters);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4DA2FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (isError || !dataold) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="text-red-400 text-4xl mb-4">!</div>
          <h2 className="text-2xl font-bold text-white mb-4">API Error</h2>
          <p className="text-white/80 mb-4">
            Failed to load collections from the backend API.
          </p>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-red-400 font-semibold mb-2">
                Error Details:
              </h3>
              <p className="text-red-300 text-sm mb-2">
                <strong>Type:</strong> {(error as any).name || "Unknown"}
              </p>
              <p className="text-red-300 text-sm mb-2">
                <strong>Message:</strong>{" "}
                {(error as any).message || "No message available"}
              </p>
              {(error as any).response && (
                <p className="text-red-300 text-sm mb-2">
                  <strong>Status:</strong> {(error as any).response.status} -{" "}
                  {(error as any).response.statusText}
                </p>
              )}
              <p className="text-red-300 text-sm">
                <strong>Endpoint:</strong> /platform/collections
              </p>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#4DA2FF] text-black rounded-lg hover:bg-[#3a8fef] transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
        <HeaderSection />
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="text-center py-20">
            <div className="text-5xl mb-4">+</div>
            <h3 className="text-2xl font-semibold mb-2">
              No Collections Found
            </h3>
            <p className="text-white/60">
              There are no collections available at the moment. Check back
              later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filtersPanel = (
    <FiltersPanel
      filters={filters}
      chainOptions={chainOptions}
      tagOptions={tagOptions}
      onChange={updateFilters}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      <HeaderSection />

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block">
            <span className="sr-only">Search collections</span>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by collection, quest, tag, chain, or address"
              className="h-12 w-full rounded-xl border border-white/15 bg-white/10 pl-12 pr-4 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-[#4DA2FF] focus:ring-2 focus:ring-[#4DA2FF]/25"
            />
          </label>
          <SelectControl
            label="Sort collections"
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(sort) => updateFilters({ sort })}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[272px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 border-r border-white/10 pr-4">
              {filtersPanel}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-5 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    All Collections
                  </h2>
                  <p className="text-sm text-white/60">
                    Showing {filteredCollections.length} of {collections.length}{" "}
                    collections
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
                </button>
              </div>
              <ActiveFilters
                filters={filters}
                onRemove={updateFilters}
                onClear={clearFilters}
              />
            </div>

            {filteredCollections.length === 0 ? (
              <NoFilteredResults
                hasSearch={Boolean(searchInput.trim())}
                onClearSearch={() => setSearchInput("")}
                onClearAll={clearFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCollections.map((collection) => {
                  const contractAddress = getContractAddress(collection);
                  const chainType =
                    collection.chain_name || collection.chainType || "SUI";
                  const normalizedChain = chainType.toLowerCase();
                  const collectionName =
                    collection.name || "Unnamed Collection";
                  const collectionDescription =
                    collection.description || "No description available";
                  const collectionId = collection.id || collection.collection_id;
                  const isBaseChain = normalizedChain.includes("base");
                  const isEvent = collection.collection_type === "Event";
                  const linkUrl = isBaseChain
                    ? `https://hashcase.co/collections/${collectionName}/${collectionId}`
                    : isEvent
                    ? `/event/${collectionName}/${collectionId}`
                    : `/collections/${collectionName}/${collectionId}`;
                  const LinkComponent = isBaseChain ? "a" : Link;
                  const linkProps = isBaseChain
                    ? {
                        href: linkUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "block group h-full",
                      }
                    : {
                        href: linkUrl,
                        className: "block group h-full",
                      };
                  const collectionImage =
                    collection.image_uri || backgroundImageHeroSection;
                  const participation = collection.participation || {};
                  const hasPoints = hasPointsParticipation(collection);

                  return (
                    <LinkComponent key={collectionId} {...linkProps}>
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all duration-300 h-full flex flex-col relative hover:border-[#4DA2FF]/45">
                        <div className="relative w-full aspect-square overflow-hidden flex-shrink-0">
                          <Image
                            src={collectionImage}
                            alt={collectionName}
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-[#4DA2FF] text-black text-xs font-semibold rounded-full flex items-center gap-1">
                              {normalizedChain.includes("sui") ? (
                                <span className="w-4 h-4 rounded-full overflow-hidden">
                                  <Image
                                    src="/suilogo.jpeg"
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                </span>
                              ) : normalizedChain.includes("base") ? (
                                <span className="w-4 h-4 rounded-full overflow-hidden">
                                  <Image
                                    src="/baselogo.png"
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                </span>
                              ) : null}
                              {chainLabel(chainType)}
                            </span>
                            {collection.collection_type && (
                              <span className="rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                                {collection.collection_type}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                            {collectionName}
                          </h3>
                          <p className="text-sm text-white/70 line-clamp-2 mb-3 flex-grow">
                            {collectionDescription}
                          </p>

                          <div className="mb-3 flex flex-wrap gap-2">
                            {participation.hasQuests && (
                              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/75">
                                Quests
                              </span>
                            )}
                            {hasPoints && (
                              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/75">
                                Points
                              </span>
                            )}
                            {participation.activeMintCount ? (
                              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/75">
                                {participation.activeMintCount} mintable
                              </span>
                            ) : null}
                          </div>

                          {contractAddress && (
                            <div className="mb-3">
                              <p className="text-xs text-white/50 mb-1">
                                Contract Address
                              </p>
                              <p className="text-xs text-[#4DA2FF] font-mono">
                                {contractAddress.length > 20
                                  ? `${contractAddress.substring(0, 20)}...`
                                  : contractAddress}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </LinkComponent>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-auto rounded-t-2xl border-t border-white/15 bg-[#071034] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Filters</h2>
                <p className="text-sm text-white/55">
                  {activeFilterCount || "No"} active filter
                  {activeFilterCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filtersPanel}
            <div className="sticky bottom-0 -mx-5 mt-6 flex gap-3 border-t border-white/10 bg-[#071034] p-5">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-lg border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 rounded-lg bg-[#4DA2FF] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#77B7FF]"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPageContent;
