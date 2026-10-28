const MESSAGES = {
  "auth/invalid-credential": "That email and password don’t match. Check both and try again.",
  "auth/wrong-password": "That email and password don’t match. Check both and try again.",
  "auth/user-not-found": "There’s no account with that email. Create one instead?",
  "auth/invalid-email": "That doesn’t look like an email address.",
  "auth/email-already-in-use": "An account with this email already exists. Sign in instead.",
  "auth/weak-password": "Use at least 6 characters for your password.",
  "auth/too-many-requests": "Too many attempts. Wait a minute, then try again.",
  "auth/popup-closed-by-user": "The Google window was closed before signing in.",
  "auth/network-request-failed": "You seem to be offline. Check your connection.",
};

export function authMessage(error) {
  return MESSAGES[error?.code] || "Something went wrong. Please try again.";
}
