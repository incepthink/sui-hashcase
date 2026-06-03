"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCollectionById } from "@/hooks/useCollections";
import {
  MapPin,
  Clock,
  Calendar,
  Languages,
  Timer,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import axiosInstance from "@/utils/axios";
import ConnectButton from "@/components/ConnectButton";
import CollectionTabs from "@/components/collectionShell/CollectionTabs";
import ShellSkeleton from "@/components/collectionShell/ShellSkeleton";
import ShellError from "@/components/collectionShell/ShellError";
import { eventTheme } from "@/components/collectionShell/theme";

interface EventLayoutProps {
  children: React.ReactNode;
}

export default function EventLayout({ children }: EventLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [refferalCode, setRefferalCode] = useState<null | string>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();

  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id as string);

  const { user } = useGlobalAppStore();

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/event/${params.collection_name}/${params.collection_id}?referral_code=${refferalCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRefferalCode = async (user_id: any) => {
    const res = await axiosInstance.get("/user/referral/code", {
      params: {
        user_id,
      },
    });
    setRefferalCode(res.data.referral_code.code);
  };

  useEffect(() => {
    if (user) {
      getRefferalCode(user.id);
    }
  }, [user]);

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
    return <ShellSkeleton theme={eventTheme} />;
  }

  if (isCollectionError || !collection) {
    return (
      <ShellError
        theme={eventTheme}
        title="Event Not Found"
        message="The requested event could not be found."
      />
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center w-full">
          <div className=" px-4 py-8 ">
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

          {refferalCode && (
            <button
              onClick={() => setShowReferralModal(true)}
              className="text-white bg-purple-600 px-4 py-2 rounded-full"
            >
              Refer
            </button>
          )}
        </div>

        {/* ── Banner ── */}
        <div className=" mx-auto px-4 mb-8">
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
                  collection.banner_image ||
                  collection.image_uri ||
                  "/banner.jpg"
                }
                alt={collection.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* ── About + Sidebar ── */}
        <div className=" mx-auto px-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {showFullDesc ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown className="w-4 h-4" />
                        </>
                      )}
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
                  <span className="text-purple-400 font-medium">
                    {language}
                  </span>
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
              {user ? (
                <Link
                  href={`/checkout/${collection.name}/${collection.id}`}
                  className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Book Tickets
                </Link>
              ) : (
                <ConnectButton mid={true} />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Tabs ── */}
      <CollectionTabs theme={eventTheme} basePath="/event" />

      {/* ── Tab Content — stable min-height prevents collapse/jump ── */}
      <div className={`${eventTheme.contentBg} min-h-[70vh]`}>{children}</div>

      {showReferralModal && (
        <div
          onClick={() => setShowReferralModal(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-[400px] mx-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">Refer a Friend</h2>
              <button
                onClick={() => setShowReferralModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 min-w-0">
              <span className="text-sm text-gray-300 truncate flex-1">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Share this link with other users to gain{" "}
              <span className="text-purple-400 font-semibold">
                10 Loyalty Points
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
