import { toast, Flip, ToastOptions, Id } from "react-toastify";

const notify = (message: string, type?: string) => {
  toast(message, {
    position: "top-right",
    type: (type as ToastOptions["type"]) || "default",
  });
};

export const notifyPromise = (message: string, type?: string) => {
  const id = toast.loading(message, {
    position: "top-right",
    type: (type as ToastOptions["type"]) || "default",
  });
  
  // Return an object with the id and a cancel function
  return {
    id,
    cancel: () => {
      toast.dismiss(id);
    }
  };
};

export const notifyResolve = (
  notificationController: { id: Id; cancel: () => void } | Id,
  message: string,
  type: string
) => {
  // Handle both old direct ID usage and new controller object
  const id = typeof notificationController === 'object' 
    ? notificationController.id 
    : notificationController;
    
  toast.update(id, {
    render: message,
    type: type as ToastOptions["type"],
    position: "top-right",
    isLoading: false,
    autoClose: 2000,
    closeButton: true,
    theme: "light",
    transition: Flip,
  });
};

export default notify;