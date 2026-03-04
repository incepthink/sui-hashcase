"use client";

import { ShoppingCart, Loader2, CheckCircle, X } from "lucide-react";
import Link from "next/link";

interface OrderSummaryProps {
  userId: number | null;
  merchantId: number | null;
  billAmount: number | null;
  selectedLoyaltyId: number | null;
  selectedRewardId: number | null;
  selectedLoyaltyCode: string | null;
  selectedRewardLabel: string | null;
  discountedBillAmount: number | null;
  onSubmit: () => void;
  submitting: boolean;
  paymentReady: boolean;
  productNames: string[];
  profileAddress: string | null;
  orderSuccess: boolean;
  onSuccessClose: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1e2a4a] last:border-0">
      <span className="text-md text-gray-400">{label}</span>
      <span
        className="text-md text-white font-medium max-w-50 truncate"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

export default function OrderSummary({
  userId,
  merchantId,
  billAmount,
  selectedLoyaltyId,
  selectedRewardId,
  selectedLoyaltyCode,
  selectedRewardLabel,
  discountedBillAmount,
  onSubmit,
  submitting,
  paymentReady,
  productNames,
  profileAddress,
  orderSuccess,
  onSuccessClose,
}: OrderSummaryProps) {
  const isReady = userId !== null && merchantId !== null && billAmount !== null && paymentReady;

  return (
    <>
      {orderSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onSuccessClose}
        >
          <div
            className="relative bg-[#0a0f2e] border border-[#1a2050] rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onSuccessClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <CheckCircle size={56} className="text-green-400 mb-4" />
            <p className="text-white font-semibold text-lg mb-1">
              Successfully Placed Order for
            </p>
            <p className="text-gray-300 text-sm mb-5">
              {productNames.join(", ")}
            </p>
            {profileAddress && (
              <Link
                href={`/profile/${profileAddress}`}
                className="text-[#2979FF] underline text-sm hover:text-blue-400 transition-colors"
              >
                View →
              </Link>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mt-8 mb-6">
          <ShoppingCart size={24} className="text-[#2979FF]" />
          <h2 className="text-2xl font-semibold text-white">Order Summary</h2>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between py-2.5 border-b border-[#1e2a4a]">
            <span className="text-md text-gray-400">Bill Amount</span>
            <span className="flex items-center gap-2 text-md font-medium">
              {discountedBillAmount !== null && billAmount !== null && (
                <span className="line-through text-gray-500">
                  ₹{billAmount.toFixed(2)}
                </span>
              )}
              <span className="text-white">
                {billAmount !== null
                  ? `₹${(discountedBillAmount ?? billAmount).toFixed(2)}`
                  : "—"}
              </span>
            </span>
          </div>
          <SummaryRow
            label="Reward"
            value={
              selectedRewardLabel ??
              (selectedRewardId !== null ? `#${selectedRewardId}` : "None")
            }
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!isReady || submitting}
          className="w-full bg-[#2979FF] hover:bg-[#1d5bbf] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating Order...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>Submit Order</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
