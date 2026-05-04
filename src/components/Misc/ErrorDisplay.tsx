import { ReactNode } from "react";
import { ProcessedError } from "@/helpers/errorHandler";
import { useI18n } from "@/i18n/useI18n";
import errorStyles from "./assets/styles/thorium-web.error.module.css";

interface ErrorDisplayProps {
  error: ProcessedError;
  title?: string;
  children?: ReactNode;
}

export const ErrorDisplay = ({ 
  error, 
  title,
  children
}: ErrorDisplayProps) => {
  const { t } = useI18n();
  
  const getUserMessage = () => {
    if (error.isNotFound()) return t("reader.app.errors.notFound");
    if (error.isAccessDenied()) return t("reader.app.errors.accessDenied");
    if (error.isNetwork()) return t("reader.app.errors.network");
    if (error.isServerError()) return t("reader.app.errors.serverError");
    if (error.isClientError()) return t("reader.app.errors.clientError");
    return t("reader.app.errors.generic");
  };

  return (
    <div className={ errorStyles.wrapper }>
      <h1 className={ errorStyles.title }>{ title || t("reader.app.errors.title") }</h1>
      <p className={ errorStyles.message }>{ getUserMessage() }</p>
      { children }
    </div>
  );
};
