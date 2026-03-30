'use client';

import { toast as sonnerToast, Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

interface ToastOptions {
  description?: string;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
  closeButton?: boolean;
  dismissible?: boolean;
}

interface ToastPromiseOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
  duration?: number;
}

const toast = {
  success(message: string, options?: ToastOptions) {
    return sonnerToast.success(message, {
      duration: options?.duration ?? 4000,
      style: options?.style,
      className: options?.className,
      closeButton: options?.closeButton ?? true,
    });
  },

  error(message: string, options?: ToastOptions) {
    return sonnerToast.error(message, {
      duration: options?.duration ?? 5000,
      style: options?.style,
      className: options?.className,
      closeButton: options?.closeButton ?? true,
    });
  },

  info(message: string, options?: ToastOptions) {
    return sonnerToast.info(message, {
      duration: options?.duration ?? 4000,
      style: options?.style,
      className: options?.className,
      closeButton: options?.closeButton ?? true,
    });
  },

  warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(message, {
      duration: options?.duration ?? 4500,
      style: options?.style,
      className: options?.className,
      closeButton: options?.closeButton ?? true,
    });
  },

  promise<T>(promise: Promise<T>, options: ToastPromiseOptions<T>) {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      duration: options.duration ?? 4000,
    });
  },

  dismiss() {
    return sonnerToast.dismiss();
  },
};

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="system"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
export type { ToastOptions, ToastPromiseOptions };
