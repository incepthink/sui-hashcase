"use client";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useCollectionById } from "@/hooks/useCollections";
import { MapPin, Clock, Calendar, Languages, Timer } from "lucide-react";

interface EventLayoutProps {
  children: React.ReactNode;
}

export default function EventLayout({ children }: EventLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();
  const pathname = usePathname();

  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id as string);

  const tabs = [
    {
      id: "points",
      label: "Points",
      href: `/event/${params.collection_name}/${params.collection_id}`,
    },
    {
      id: "quests",
      label: "Quests",
      href: `/event/${params.collection_name}/${params.collection_id}/quests`,
    },
    {
      id: "nfts",
      label: "NFTs",
      href: `/event/${params.collection_name}/${params.collection_id}/nfts`,
    },
    {
      id: "badges",
      label: "Badges",
      href: `/event/${params.collection_name}/${params.collection_id}/badges`,
    },
  ];

  const renderDescriptionWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  if (!mounted || isCollectionLoading) {
    return (
      <div className="w-full min-h-[90vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-purple-900/20 to-transparent -skew-x-12 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-purple-400 to-pink-500 drop-shadow-lg leading-tight">
            Loading...
          </h1>
          <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            Fetching event data
          </p>
        </div>
      </div>
    );
  }

  if (isCollectionError || !collection) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 drop-shadow-lg leading-tight">
            Event Not Found
          </h1>
          <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            The requested event could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Placeholder event-specific fields (wire up from collection API when backend adds them)
  const eventDate = (collection as any).event_date ?? "TBD";
  const eventLocation = (collection as any).location ?? "TBD";
  const gatesOpen = (collection as any).gates_open ?? "TBD";
  const price = (collection as any).price ?? "TBD";
  const language = (collection as any).language ?? "TBD";
  const duration = (collection as any).duration ?? "TBD";

  const description = collection.description ?? "";
  const descPreview = description.slice(0, 200);
  const hasMore = description.length > 200;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
          {collection.name}
        </h1>
        <p className="text-sm text-gray-400 flex items-center gap-2 flex-wrap">
          <span className="text-purple-400 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {eventDate}
          </span>
          {eventLocation !== "TBD" && (
            <>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {eventLocation}
              </span>
            </>
          )}
        </p>
      </div>

      {/* ── Banner ── */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="w-full h-[360px] rounded-2xl overflow-hidden bg-[#1a1a2e] relative">
          <img
            src={
              collection.banner_image || collection.image_uri || "/banner.jpg"
            }
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="w-full h-full backdrop-blur-md absolute top-0">
            <img
              src={
                collection.banner_image || collection.image_uri || "/banner.jpg"
              }
              alt={collection.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* ── About + Sidebar ── */}
      <div className="max-w-5xl mx-auto px-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: About */}
        <div className="md:col-span-2 flex flex-col justify-between gap-4">
          <div className="">
            <h2 className="text-xl font-bold mb-3">About</h2>
            {description ? (
              <>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {showFullDesc
                    ? renderDescriptionWithLinks(description)
                    : renderDescriptionWithLinks(descPreview)}
                  {hasMore && !showFullDesc && "..."}
                </p>
                {hasMore && (
                  <button
                    onClick={() => setShowFullDesc((v) => !v)}
                    className="mt-2 text-purple-400 text-sm font-medium flex items-center gap-1 hover:text-purple-300 transition-colors"
                  >
                    {showFullDesc ? "Show less ▲" : "Read more ▼"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No description available.
              </p>
            )}
          </div>

          {/* ── Things to know ── */}
          <div className="">
            <h2 className="text-xl font-bold mb-4">Things to know</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-gray-400" />
                Event will be in{" "}
                <span className="text-purple-400 font-medium">{language}</span>
              </span>
              <span className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-400" />
                Duration <span className="font-medium">{duration}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Info card */}
        <div className="bg-purple-600/10 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 h-fit">
          <div className="flex items-start gap-3 pb-4 border-b border-white/10">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium leading-snug">
                {eventLocation}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-4 border-b border-white/10">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">
                {gatesOpen !== "TBD"
                  ? `Gates open at ${gatesOpen}`
                  : "Gates open: TBD"}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                View full schedule &amp; timeline
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-white font-bold text-lg">
              {price !== "TBD" ? price : "Price TBD"}
            </p>
            <button className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
              Book Tickets
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-8">
            {tabs.map((tab) => {
              let isActive = false;
              if (tab.id === "points") {
                isActive = pathname === tab.href;
              } else {
                isActive =
                  pathname.includes(`/${tab.id}/`) ||
                  pathname.endsWith(`/${tab.id}`);
              }
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative py-4 font-medium text-sm transition-colors ${
                    isActive
                      ? "text-purple-400"
                      : "text-gray-400 hover:text-purple-300"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 rounded-t" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="bg-[#0d0d0d]">{children}</div>
    </div>
  );
}
