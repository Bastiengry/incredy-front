export type NotificationContextType = {
  notifySuccess: (message: string) => void;
  notifyInfo: (message: string) => void;
  notifyWarn: (message: string) => void;
  notifyError: (message: string) => void;
};
