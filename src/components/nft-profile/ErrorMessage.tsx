interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
      <div className="text-red-400 text-center">
        <p className="text-xl">{message}</p>
      </div>
    </div>
  );
}
