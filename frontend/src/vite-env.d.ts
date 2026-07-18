/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface IdConfiguration {
  client_id: string;
  auto_select?: boolean;
  callback: (response: CredentialResponse) => void;
  context?: string;
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
  itp_support?: boolean;
}

interface CredentialResponse {
  credential: string;
  select_by:
    | 'auto'
    | 'user'
    | 'user_1tap'
    | 'user_2tap'
    | 'btn'
    | 'btn_confirm'
    | 'btn_add_session'
    | 'btn_confirm_add_session';
}

interface GsiButtonConfiguration {
  type: 'standard' | 'icon';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: IdConfiguration) => void;
        prompt: (momentListener?: (moment: string) => void) => void;
        renderButton: (
          parent: HTMLElement,
          options: GsiButtonConfiguration,
        ) => void;
        disableAutoSelect: () => void;
        storeCredential: (
          credential: string,
          callback?: () => void,
        ) => void;
        cancel: () => void;
        onGoogleLibraryLoad: () => void;
        revoke: (hint: string, callback?: (response: { error?: string }) => void) => void;
      };
    };
  };
}
