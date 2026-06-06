import i18n from "../i18n";
import { showToast } from "../components/sonner";

/**
 * Handles API errors by translating the error code and displaying a toast.
 * @param error The error object from the API response
 * @returns The translated error message
 */
export const handleApiError = (error: any) => {
  console.log("handleApiError received:", error);
  
  // Extract error code from various possible structures (RTK Query often wraps it in an 'error' property)
  const actualError = error?.error || error;
  const errorCode = actualError?.data?.code || actualError?.code || "GENERIC_ERROR";
  console.log("Extracted errorCode:", errorCode);
  
  // Translate the error code using i18next
  let message = i18n.t(`errors.${errorCode}`);
  console.log("Translated message:", message);
  
  // If translation failed (returns the key), fallback to the message from API or generic error
  if (message === `errors.${errorCode}`) {
    message = actualError?.data?.message || actualError?.message || i18n.t("errors.GENERIC_ERROR");
  }

  showToast(message, "error");
  
  return message;
};


/**
 * Handles API errors by translating the error code and displaying a toast.
 * @param error The error object from the API response
 * @returns The translated error message
 */
export const getApiError = (error: any) => {
  console.log("getApiError received:", error);
  
  // Extract error code from various possible structures (RTK Query often wraps it in an 'error' property)
  const actualError = error?.error || error;
  const errorCode = actualError?.data?.code || actualError?.code || "GENERIC_ERROR";
  console.log("Extracted errorCode:", errorCode);
  
  // Translate the error code using i18next
  let message = i18n.t(`errors.${errorCode}`);
  console.log("Translated message:", message);
  
  // If translation failed (returns the key), fallback to the message from API or generic error
  if (message === `errors.${errorCode}`) {
    message = actualError?.data?.message || actualError?.message || i18n.t("errors.GENERIC_ERROR");
  }
  
  return message;
};
