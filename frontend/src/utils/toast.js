import { toast } from "react-toastify";

export const showSuccess = (msg) => {
  toast.success(msg, {
    style: {
      background: "#064e3bc0",
      color: "#d1fae5",
    },
  });
};

export const showError = (msg) => {
  toast.error(msg, {
    style: {
      background: "#7f1d1dbd",
      color: "#fee2e2",
    },
  });
};