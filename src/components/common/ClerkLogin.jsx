import { SignIn } from '@clerk/clerk-react';
import { Zap } from 'lucide-react';
import ClientSwitcher from './ClientSwitcher';

/**
 * Clerk Login Component
 * Used when HTTP client is enabled
 */
export default function ClerkLogin() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }}></div>

      {/* Client Switcher */}
      <ClientSwitcher />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 mb-6 shadow-2xl shadow-purple-500/50 animate-glow">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Startup OS
          </h1>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white dark:bg-zinc-900 shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl",
                headerTitle: "text-2xl font-bold text-zinc-900 dark:text-zinc-100",
                headerSubtitle: "text-zinc-600 dark:text-zinc-400",
                socialButtonsBlockButton: "bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-semibold shadow-sm",
                socialButtonsBlockButtonText: "text-zinc-900 dark:text-zinc-100 font-medium",
                dividerLine: "bg-zinc-300 dark:bg-zinc-700",
                dividerText: "text-zinc-500 dark:text-zinc-400",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg",
                formFieldInput: "bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-purple-500",
                formFieldLabel: "text-zinc-700 dark:text-zinc-300 font-medium",
                footerActionText: "text-zinc-600 dark:text-zinc-400",
                footerActionLink: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold underline",
                identityPreviewText: "text-zinc-900 dark:text-zinc-100",
                identityPreviewEditButtonIcon: "text-zinc-600 dark:text-zinc-400",
                alternativeMethodsBlockButton: "bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700",
                alternativeMethodsBlockButtonText: "text-zinc-900 dark:text-zinc-100",
                formResendCodeLink: "text-purple-600 dark:text-purple-400",
                otpCodeFieldInput: "bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700",
                // Hide "last used" and similar metadata
                formFieldInfoText: "hidden",
                formFieldSuccessText: "hidden",
                formFieldHintText: "hidden",
                identityPreviewEditButton: "hidden",
              }
            }}
            routing="virtual"
            afterSignInUrl="/home"
            afterSignUpUrl="/home"
            signUpForceRedirectUrl="/home"
            signInForceRedirectUrl="/home"
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3 animate-in fade-in duration-1000">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 backdrop-blur-sm">
            🔒 Secure authentication powered by Clerk
          </p>
        </div>
      </div>
    </div>
  );
}
