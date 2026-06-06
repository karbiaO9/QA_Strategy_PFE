import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { authApi } from '../api/auth-api';
import { getApiError, showToast } from '@physio-connect-frontend/shared-ui'; // Adjust path if local

export const toastMiddleware = createListenerMiddleware();

// Helper to extract clean error messages from backend responses
const getErrorMessage = (error: any, fallback: string): string => {
  if (!error) return fallback;
  
  // Handle standard RTK Query FetchBaseQueryError structure
  const errorMessage = getApiError(error);
  
  return errorMessage || fallback;
};

// 1. Success Toast Mappings
const SUCCESS_MESSAGES: Record<string, string> = {
  login: "Connexion réussie ! Bienvenue sur votre espace.",
  register: "Votre compte a été créé avec succès.",
  logout: "Vous avez été déconnecté avec succès.",
  forgotPassword: "Un email de réinitialisation vous a été envoyé.",
  verifyCode: "Code de vérification validé avec succès.",
  resetPassword: "Votre mot de passe a été réinitialisé.",
  changePassword: "Votre mot de passe a été modifié avec succès.",
  selectProfile: "Changement de cabinet effectué.",
  addProfile: "Le nouveau profil a été créé avec succès.",
  addPractitioner: "L'invitation a été envoyée avec succès.",
  acceptInvitation: "L'invitation a été acceptée avec succès.",
  attachProfile: "Le profil a été rattaché avec succès.",
};

// 2. Error Toast Fallback Mappings (If backend doesn't supply a specific string)
const ERROR_FALLBACKS: Record<string, string> = {
  login: "Échec de la connexion. Veuillez vérifier vos identifiants.",
  register: "Impossible de créer le compte.",
  logout: "Erreur lors de la déconnexion.",
  forgotPassword: "Impossible d'envoyer l'email de récupération.",
  verifyCode: "Code de vérification invalide.",
  resetPassword: "Échec de la réinitialisation du mot de passe.",
  changePassword: "Impossible de modifier le mot de passe.",
  selectProfile: "Impossible de changer de cabinet.",
  addProfile: "Erreur lors de la création du profil.",
  addPractitioner: "Impossible d'envoyer l'invitation.",
  acceptInvitation: "Erreur lors de l'acceptation de l'invitation.",
  attachProfile: "Impossible de rattacher le profil.",
};

// Register the general listener matcher
toastMiddleware.startListening({
  matcher: isAnyOf(
    authApi.endpoints.login.matchFulfilled,
    authApi.endpoints.login.matchRejected,
    authApi.endpoints.register.matchFulfilled,
    authApi.endpoints.register.matchRejected,
    authApi.endpoints.logout.matchFulfilled,
    authApi.endpoints.logout.matchRejected,
    authApi.endpoints.forgotPassword.matchFulfilled,
    authApi.endpoints.forgotPassword.matchRejected,
    authApi.endpoints.verifyCode.matchFulfilled,
    authApi.endpoints.verifyCode.matchRejected,
    authApi.endpoints.resetPassword.matchFulfilled,
    authApi.endpoints.resetPassword.matchRejected,
    authApi.endpoints.changePassword.matchFulfilled,
    authApi.endpoints.changePassword.matchRejected,
    authApi.endpoints.selectProfile.matchFulfilled,
    authApi.endpoints.selectProfile.matchRejected,
    authApi.endpoints.addProfile.matchFulfilled,
    authApi.endpoints.addProfile.matchRejected,
    authApi.endpoints.addPractitioner.matchFulfilled,
    authApi.endpoints.addPractitioner.matchRejected,
    authApi.endpoints.acceptInvitation.matchFulfilled,
    authApi.endpoints.acceptInvitation.matchRejected,
    authApi.endpoints.attachProfile.matchFulfilled,
    authApi.endpoints.attachProfile.matchRejected
  ),
  effect: async (action, listenerApi) => {
    // Extract endpoint metadata injected by RTK Query
    const meta = action.meta as { arg?: { endpointName?: string } } | undefined;
    const endpointName = meta?.arg?.endpointName;
    const isFulfilled = action.type.endsWith('/fulfilled');

    if (!endpointName) return;

    if (isFulfilled) {
      const msg = SUCCESS_MESSAGES[endpointName];
      if (msg) {
        showToast(msg, "success");
      }
    } else {
      // It's a rejected action
      const errorPayload = action.payload;
      const fallback = ERROR_FALLBACKS[endpointName] || "Une erreur est survenue.";
      const cleanMessage = getErrorMessage(errorPayload, fallback);
      
      showToast(cleanMessage, "error");
    }
  },
});