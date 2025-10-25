// @/components/nft/NFTLocation.tsx
interface NFTLocationProps {
  latitude?: string;
  longitude?: string;
}

export default function NFTLocation({ latitude, longitude }: NFTLocationProps) {
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
      <h3 className="font-semibold text-white/90 mb-2">Location</h3>
      <p className="text-sm text-gray-300">
        Lat: {latitude}, Long: {longitude}
      </p>
    </div>
  );
}
