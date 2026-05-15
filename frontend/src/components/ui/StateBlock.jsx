import { Loader2, Sprout } from "lucide-react";

const LoadingState = ({ label = "Loading" }) => (
  <div className="shell-panel flex min-h-48 items-center justify-center p-6 text-moss">
    <Loader2 className="mr-3 h-5 w-5 animate-spin text-leaf-500" />
    <span className="font-semibold">{label}</span>
  </div>
);

const ErrorState = ({ message = "Something went wrong", action }) => (
  <div className="shell-panel p-6">
    <p className="font-bold text-petal-700">{message}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

const EmptyState = ({ title = "Nothing here yet", message, action }) => (
  <div className="shell-panel flex min-h-52 flex-col items-center justify-center p-8 text-center">
    <Sprout className="h-9 w-9 text-leaf-500" />
    <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
    {message ? <p className="mt-2 max-w-md text-sm text-moss">{message}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export { EmptyState, ErrorState, LoadingState };
