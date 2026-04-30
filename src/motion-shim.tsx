import * as React from "react";

type PresenceProps = {
  children?: React.ReactNode;
};

type MotionProxy = Record<string, React.ComponentType<any>>;

// Lightweight fallback for environments where animation packages fail to resolve.
// It preserves rendering behavior by mapping motion elements to plain HTML tags.
export const motion: MotionProxy = new Proxy(
  {},
  {
    get: (_target, tag: string) =>
      React.forwardRef<any, React.HTMLAttributes<HTMLElement>>(
        ({ children, ...rest }, ref) =>
          React.createElement(tag, { ...rest, ref }, children),
      ),
  },
) as MotionProxy;

export function AnimatePresence({ children }: PresenceProps) {
  return <>{children}</>;
}
