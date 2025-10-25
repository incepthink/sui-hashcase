// @/components/nft/NFTPrice.tsx
interface NFTPriceProps {
  price: number;
}

export default function NFTPrice({ price }: NFTPriceProps) {
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
      <p className="text-sm text-gray-400 mb-1">Price</p>
      <p className="text-3xl font-bold text-white">{price}</p>
    </div>
  );
}
