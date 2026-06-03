import React, { useEffect } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    },
  },
});

const formFields = {
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
    },
  },
};

const AutofillCredentials = () => {
  useEffect(() => {
    const fillFields = () => {
      const usernameInput = document.querySelector('input[name="username"]') as HTMLInputElement | null;
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement | null;

      if (usernameInput && passwordInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        )?.set;

        if (nativeInputValueSetter) {
          if (!usernameInput.value) {
            nativeInputValueSetter.call(usernameInput, "trialuser");
            usernameInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
          if (!passwordInput.value) {
            nativeInputValueSetter.call(passwordInput, "Trial@Pwd123");
            passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      }
    };

    const interval = setInterval(fillFields, 200);
    fillFields();
    return () => clearInterval(interval);
  }, []);

  return null;
};

const AuthContainer = ({ children }: { children: React.ReactNode }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  if (authStatus === "configuring") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-black p-4 space-y-5">
        <AutofillCredentials />
        
        {/* Trial User Credentials Info Banner */}
        <div className="w-full max-w-[400px] rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-center shadow-md dark:border-amber-500/20 dark:bg-amber-950/15 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Trial Mode Access
          </div>
          <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
            Since AWS email confirmation is currently disabled, please use the pre-configured trial credentials below to explore the dashboard:
          </p>
          <div className="mt-4 flex flex-col gap-2 bg-white/70 dark:bg-black/35 py-2.5 px-4 rounded-xl border border-gray-150 dark:border-stroke-dark text-xs text-gray-700 dark:text-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 dark:text-gray-500 font-medium">Username:</span>
              <strong className="select-all font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">trialuser</strong>
            </div>
            <div className="h-[1px] w-full bg-gray-200/60 dark:bg-gray-800/60" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 dark:text-gray-500 font-medium">Password:</span>
              <strong className="select-all font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Trial@Pwd123</strong>
            </div>
          </div>
        </div>

        <Authenticator 
          formFields={formFields} 
          signUpAttributes={["email"]}
        />
      </div>
    );
  }

  return <>{children}</>;
};

const AuthProvider = ({ children }: any) => {
  return (
    <Authenticator.Provider>
      <AuthContainer>{children}</AuthContainer>
    </Authenticator.Provider>
  );
};

export default AuthProvider;