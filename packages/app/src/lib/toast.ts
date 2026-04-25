type ToastDetail = {
  message: string;
  tone?: "success" | "error" | "info";
};

const EVENT = "alphaai:toast";

export function toast(detail: ToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastDetail>(EVENT, { detail }));
}

export function subscribeToToasts(handler: (detail: ToastDetail) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const ce = e as CustomEvent<ToastDetail>;
    if (ce?.detail?.message) handler(ce.detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

