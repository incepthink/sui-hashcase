import { X } from "lucide-react";
import React from "react";

interface ModalProps {
  openModal: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ openModal, onClose, children }) => {
  const CloseModal = () => {
    onClose();
  };
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 flex justify-center items-center transition-colors ${
        openModal ? "visible bg-black/40" : "invisible"
      } `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#1b1b1b] text-white rounded-xl shadow md:p-6 p-3 transition-all ${
          openModal ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
      >
        <div className="flex items-center justify-center gap-x-4">
          <h1 className={`md:text-2xl text-lg mb-2 mx-4 font-bold `}>
            Connect Your Wallet
          </h1>
          <button
            onClick={CloseModal}
            className="pb-6 rounded-lg text-gray-400 bg-[#1b1b1b] hover:bg-[#1d1d1d]"
          >
            <X />
          </button>
        </div>
        <hr />
        {children}
      </div>
    </div>
  );
};

export default Modal;
