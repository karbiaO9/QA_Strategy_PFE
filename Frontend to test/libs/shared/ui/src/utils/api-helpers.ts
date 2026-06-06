import { handleApiError } from "./error-handler";

/**
 * Helper to handle default API effects (primarily automatic error reporting via toasts).
 * Use this in RTK Query's onQueryStarted for mutations that don't require custom state updates.
 */
export const handleDefaultApiEffect = async (queryFulfilled: Promise<any>) => {
  try {
    await queryFulfilled;
  } catch (err) {
    handleApiError(err);
  }
};

/**
 * Helper to sync Redux state with API response data while handling errors.
 * @param queryFulfilled The queryFulfilled promise from RTK Query
 * @param dispatch The dispatch function from Redux
 * @param syncAction A callback that returns the action to dispatch with the received data
 */
export const handleSyncAuthState = async (
  queryFulfilled: Promise<any>,
  dispatch: any,
  syncAction: (data: any) => any
) => {
  try {
    const { data } = await queryFulfilled;
    if (data?.user) {
      dispatch(syncAction(data));
    }
  } catch (err) {
    handleApiError(err);
  }
};
