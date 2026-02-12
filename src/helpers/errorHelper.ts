export interface IBackendError {
  data?: {
    message?: string;
    errorMessages?: Array<{
      path: string;
      message: string;
    }>;
  };
}

/**
 * Extract field-level errors from backend response
 * Converts "body.whatsappNumber" to "whatsappNumber"
 */
export const extractFieldErrors = (error: IBackendError) => {
  const fieldErrors: Record<string, string> = {};

  if (error?.data?.errorMessages) {
    error.data.errorMessages.forEach((err) => {
      // Remove "body." prefix from path
      const fieldName = err.path.replace("body.", "");
      fieldErrors[fieldName] = err.message;
    });
  }

  return fieldErrors;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: IBackendError): string => {
  if (error?.data?.errorMessages && error.data.errorMessages.length > 0) {
    return error.data.errorMessages.map((err) => err.message).join(", ");
  }
  return error?.data?.message || "An error occurred";
};
