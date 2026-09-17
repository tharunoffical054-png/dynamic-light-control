# Real NoteVault accounts

## What will change
- Replace the simulated email/password login and signup with real Lovable Cloud authentication.
- Replace the simulated Google dialog with managed Google sign-in; remove the unsupported GitHub option from the login screen.
- Restore an existing session automatically so users remain signed in after refreshes and Android WebView restarts.
- Make sign-out clear the active account securely.
- Save each user’s full name and profile photo in a private profile record.
- Add working forgot-password and reset-password screens.
- Preserve the existing single-lamp desktop and Android layouts.

## Data and security
- Create a private `profiles` table keyed to each authenticated account.
- Automatically create a profile when a new account is registered.
- Allow users to read and update only their own profile.
- Keep passwords exclusively in the managed authentication system, never in the app database.

## Validation
- Verify signup, sign-in failure handling, session restoration, sign-out, and password recovery.
- Check desktop and Android-sized layouts and confirm the single lamp remains unchanged.
