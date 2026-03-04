"use client";

import { useCallback, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import notify from "@/utils/notify";
import RewardsCart, { RewardDiscount } from "@/components/checkout/RewardsCart";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCart } from "@/context/CartContext";
import { useCollectionById } from "@/hooks/useCollections";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import PaymentMethod, { PaymentMethodData } from "@/components/checkout/PymentMethod";

function computeDiscountedAmount(
  subtotal: number,
  discount: RewardDiscount,
  cart: ReturnType<typeof useCart>["cart"],
): number | null {
  if (!discount.discountValue) return null;
  const val = parseFloat(discount.discountValue);
  if (isNaN(val)) return null;

  if (discount.type === "DISCOUNT_ON_TOTAL") {
    if (discount.discountType === "PERCENTAGE")
      return Math.max(0, subtotal * (1 - val / 100));
    if (discount.discountType === "FIXED_AMOUNT")
      return Math.max(0, subtotal - val);
  }

  if (discount.type === "DISCOUNT_ON_ITEM" && discount.product_ids?.length) {
    const matchedItems = cart.filter((item) =>
      discount.product_ids!.includes(item.id),
    );
    if (matchedItems.length === 0) return null;
    const matchedSubtotal = matchedItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );
    const unmatchedSubtotal = subtotal - matchedSubtotal;
    if (discount.discountType === "PERCENTAGE") {
      return unmatchedSubtotal + matchedSubtotal * (1 - val / 100);
    }
    if (discount.discountType === "FIXED_AMOUNT") {
      return unmatchedSubtotal + Math.max(0, matchedSubtotal - val);
    }
  }

  return null;
}

function CheckoutContent() {
  const { cart, addToCart, removeFromCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const { user } = useGlobalAppStore();
  const { address: walletAddress } = useWalletAddress();
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id as string);
  const [selectedLoyaltyId, setSelectedLoyaltyId] = useState<number | null>(
    null,
  );
  const [selectedLoyaltyCode, setSelectedLoyaltyCode] = useState<string | null>(
    null,
  );
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);
  const [selectedRewardLabel, setSelectedRewardLabel] = useState<string | null>(
    null,
  );
  const [selectedRewardDiscount, setSelectedRewardDiscount] =
    useState<RewardDiscount | null>(null);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleLoyaltySelect = useCallback(
    (id: number | null, code: string | null) => {
      setSelectedLoyaltyId(id);
      setSelectedLoyaltyCode(code);
    },
    [],
  );

  const handleRewardSelect = useCallback(
    (
      id: number | null,
      label: string | null,
      discount: RewardDiscount | null,
    ) => {
      setSelectedRewardId(id);
      setSelectedRewardLabel(label);
      setSelectedRewardDiscount(discount);
    },
    [],
  );

  if (isCollectionLoading) {
    return (
      <div className="bg-[#00041F] min-h-screen text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (isCollectionError || !collection) {
    return (
      <div className="bg-[#00041F] min-h-screen text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Collection not found.</p>
        <button
          onClick={() => router.push("/event")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Browse Events
        </button>
      </div>
    );
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );
  const effectiveBillAmount = selectedRewardDiscount
    ? (computeDiscountedAmount(subtotal, selectedRewardDiscount, cart) ??
      subtotal)
    : subtotal;

  const handleSubmit = async () => {
    if (!collection.owner_id) return;
    if (!paymentMethodData) {
      notify("Please fill in payment details.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { bill_amount: _, ...paymentDetails } = paymentMethodData;
      await axiosInstance.post(
        "/platform/owner/order/create/demo",
        {
          user_id: user?.id,
          bill_amount: effectiveBillAmount,
          selected_loyalty_id: selectedLoyaltyId,
          selected_reward_id: selectedRewardId,
          product_ids: cart.map((item) => item.id),
          payment_method: paymentDetails,
        },
        { params: { owner_id: collection.owner_id } },
      );
      setOrderSuccess(true);
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { message?: string; details?: { info?: { issues?: { message: string }[] } } } } })?.response?.data;
      const issues = apiError?.details?.info?.issues;
      const errorMessage = issues?.length
        ? issues.map((i) => i.message).join(", ")
        : apiError?.message || "Failed to create order. Please try again.";
      notify(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className=" text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[#0a0f2e] transition-colors"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11M10 19a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"
              />
            </svg>
            <p className="text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() =>
                router.push(
                  `/checkout/${params.collection_name}/${params.collection_id}`,
                )
              }
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0a0f2e] border border-[#1a2050] rounded-2xl p-4 flex gap-4 items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-[#060b1e] flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/80x80/0a0f2e/6366f1?text=?";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-indigo-400 font-bold mt-0.5">
                      ${item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-lg bg-[#1a2050] hover:bg-[#252d6b] text-white font-bold flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="text-white font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-gray-300 font-semibold w-20 text-right flex-shrink-0">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <RewardsCart
              owner_id={collection.owner_id}
              userId={user?.id || null}
              selectedRewardId={selectedRewardId}
              onSelect={handleRewardSelect}
            />

            <PaymentMethod
              billAmount={effectiveBillAmount}
              onChange={setPaymentMethodData}
            />
            <OrderSummary
              userId={user?.id || null}
              merchantId={collection.owner_id}
              billAmount={subtotal}
              selectedLoyaltyId={selectedLoyaltyId}
              selectedRewardId={selectedRewardId}
              selectedLoyaltyCode={selectedLoyaltyCode}
              selectedRewardLabel={selectedRewardLabel}
              discountedBillAmount={
                selectedRewardDiscount
                  ? computeDiscountedAmount(
                      subtotal,
                      selectedRewardDiscount,
                      cart,
                    )
                  : null
              }
              onSubmit={handleSubmit}
              submitting={submitting}
              paymentReady={paymentMethodData !== null}
              productNames={cart.map((item) => item.name)}
              profileAddress={walletAddress}
              orderSuccess={orderSuccess}
              onSuccessClose={() => router.push(`/event/${params.collection_name}/${params.collection_id}`)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
