import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import ConfirmDialog, { type ConfirmOptions } from "@/components/ConfirmDialog";

type ConfirmFn = (options: ConfirmOptions) => Promise<void>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface State extends ConfirmOptions {
  open: boolean;
  resolve: () => void;
  reject: () => void;
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State | null>(null);
  // keep stable ref so confirm() identity never changes
  const stateRef = useRef(state);
  stateRef.current = state;

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<void>((resolve, reject) => {
        setState({ ...options, open: true, resolve, reject });
      }),
    []
  );

  const handleConfirm = () => {
    state?.resolve();
    setState(null);
  };

  const handleCancel = () => {
    state?.reject();
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <ConfirmDialog
          open={state.open}
          title={state.title}
          description={state.description}
          confirmLabel={state.confirmLabel}
          cancelLabel={state.cancelLabel}
          variant={state.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
};
