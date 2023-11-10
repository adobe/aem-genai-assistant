/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 **************************************************************************/

import { AdobeIMS } from "@identity/imslib";
import { IEnvironment } from "@identity/imslib/adobe-id/IEnvironment.js";
import { PopupSettings } from "@identity/imslib/adobe-ims/sign-in/PopupSettings";
import { ITokenInformation } from "@identity/imslib/adobe-id/custom-types/CustomTypes.js";
import { IAdobeIdData } from "@identity/imslib/adobe-id/IAdobeIdData";
import { ImsAuthProps } from "../types/ImsAuthFlow";

/**
 * Service responsible for initializing the IMS library and handling authentication.
 */
export class ImsAuthService {
  /**
   * IMS service instance.
   */
  private adobeIms?: AdobeIMS;

  /**
   * Flag used to block the access to signin, signout functions in case the library is not fully initialized
   * true if library is initialized, otherwise false
   */
  private initialized = false;

  /**
   * IMS Profile information
   */
  private profile;

  /**
   * The current IMS access token that is received from Adobe IMS
   */
  imsToken?: string;

  /**
   * IMS client ID to pass in to adobe IMS
   */
  imsClientId?: string;

  /**
   * IMS environment to pass in to adobe IMS
   */
  env?: any;

  /**
   * IMS environment to pass in to adobe IMS
   */
  redirectUrl?: string;

  /**
   * IMS scope to pass in to adobe IMS
   */
  imsScope?: string;

  /**
   * IMS locale
   */
  imsLocale?: string = "en_US";

  /**
   * IMS modal mode. True to open the IMS flow in a modal, false for full page refresh.
   */
  modalMode?: boolean = true;

  /**
   * IMS modal settings. Used to configure the popup width/height/x-y position.
   */
  modalSettings?: PopupSettings;

  /**
   * Any other options to pass to the IMS library
   */
  adobeImsOptions?: Partial<IAdobeIdData>;

  /**
   * Invoked after ImsAuthService has been initialized.
   * This is the way for the parent component to get access to the ImsAuthService instance.
   * @param imsAuthService
   */
  onImsServiceInitialized?: (imsAuthService: ImsAuthService) => void;

  /**
   * IMS callback for when the onAccessToken is completed
   * Useful when you want to make sure AssetSelector is only rendered after the token is received
   * @param data ITokenInformation object
   */
  onAccessTokenReceived?: (data: ITokenInformation) => void;

  /**
   * IMS callback for when the onAccessTokenExpired is called.
   * Useful when you want to perform some action when the token is expired/is not present. For example, you can redirect to the login page by calling triggerAuthFlow.
   */
  onAccessTokenExpired?: () => void;

  /**
   * IMS callback for when there is an error
   * @param type error type
   * @param message error message
   */
  onErrorReceived?: (type, message) => void;

  get initAdobeImsData() {
    // set up adobe IMS data
    const adobeImsData = {
      client_id: this.imsClientId,
      scope: this.imsScope,
      environment: this.env,
      useLocalStorage: false,
      // if true, the token will be validated against validate token api
      autoValidateToken: true,
      redirect_uri: this.redirectUrl,
      onReady: this.onReady.bind(this),
      onError: this.onError.bind(this),
      onAccessToken: this.onAccessToken.bind(this),
      onAccessTokenHasExpired: this.onAccessTokenHasExpired.bind(this),
      onReauthAccessToken: this.onReAuthAccessToken.bind(this),
      locale: this.imsLocale,
      modalMode: this.modalMode,
      modalSettings: this.modalSettings,
      ...this.adobeImsOptions,
    };
    return adobeImsData;
  }

  private static instance: ImsAuthService;

  private constructor(init: Partial<ImsAuthService>) {
    const props = {
      ...init,
      env: this.getEnv(init.env),
    };
    Object.assign(this, props);
    this.adobeIms = new AdobeIMS(this.initAdobeImsData);
  }

  public static getInstance(
    init?: Partial<ImsAuthService>,
    forceRenew = false
  ): ImsAuthService {
    if (!ImsAuthService.instance || forceRenew) {
      if (!init?.imsClientId || !init?.imsScope) {
        throw new TypeError(
          "Assistant: imsClientId, imsScope are required parameters. Did you forget to pass required props?"
        );
      }
      ImsAuthService.instance = new ImsAuthService(init);
    }
    return ImsAuthService.instance;
  }

  getEnv(env) {
    if (env && env.toUpperCase() !== "PROD") {
      return IEnvironment.STAGE;
    }
    return IEnvironment.PROD;
  }

  /**
   * Returns the internal AdobeIMS instance. This is mainly used for extending beyond the current facade implementation.
   * @returns the internal adobeIms
   */
  getAdobeIms() {
    return this.adobeIms;
  }

  /**
   * Called on library initialization or page reloading by IMS library.
   */
  async initialize() {
    this.profile = null;
    await this.adobeIms.initialize();
    this.initialized = true;
    this.onImsServiceInitialized?.(this);
  }

  /**
   * Method used to check if the user is signed in or not.
   *
   * @returns true if there is a user currently logged in into IMS
   */
  isSignedInUser() {
    return this.adobeIms.isSignedInUser();
  }

  /**
   * Method used to check if the user is signed in or not.
   * If not, it will trigger the auth flow.
   */
  async triggerAuthFlow() {
    if (!this.isSignedInUser()) {
      return this.signIn();
    }
  }

  /**
   * Returns the access token value from IMS service
   * @returns imsToken value or undefined
   */
  getImsToken() {
    if (!this.initialized) {
      this.initialize();
    }
    const token = this.adobeIms.getAccessToken()?.token;
    this.imsToken = token || this.imsToken;
    return this.imsToken;
  }

  async getProfile() {
    if (this.profile) {
      return this.profile;
    }
    this.profile = this.adobeIms.getProfile();
    return this.profile;
  }

  /**
   * Sets the access token value
   * Workaround - onAccessToken lifecycle hook is not triggered when the user login for the first time.
   * So, we need to set the token value manually if we have it.
   * @param token imsToken value
   * @returns imsToken value or undefined
   */
  setImsToken(token = null) {
    if (token) {
      this.imsToken = token;
    } else {
      this.imsToken = this.adobeIms.getAccessToken()?.token;
    }
    // TODO: FIX: token is not of type ITokenInformation, because without full refresh, we grab the token from the URLParams
    // However, for now some consumer need this onAccessToken callback to be triggered when the token is set manually
    this.onAccessToken(this.imsToken);
  }

  /**
   * Method used to redirect the user to signIn url
   * After user enters credentials, user is redirected to initial uri on authentication success
   * and onAccessToken is triggered subsequently
   */
  async signIn() {
    let redirectUrl;
    try {
      redirectUrl = new URL(this.redirectUrl).href;
    } finally {
      await this.adobeIms.signIn({
        ...(redirectUrl && { redirect_uri: redirectUrl }),
      });
    }
  }

  /**
   * Method used for sign out the user
   */
  async signOut() {
    this.imsToken = undefined;
    this.adobeIms.signOut();
  }

  /**
   * Refresh the existing token.
   */
  async refreshToken() {
    return this.adobeIms.refreshToken();
  }

  /**
   * IMS callback when a token is generated
   */
  /* istanbul ignore next */
  private async onAccessToken(data) {
    const token = typeof data === "string" ? data : data?.token;
    this.imsToken = token;

    if (this.profile === undefined || this.profile === null) {
      // ASSETS-25588 - get profile info to be used in Gainsight
      // TODO: remove refreshToken. It should not be needed.
      // We're calling refreshToken as a workaround for Ims not returning profile info even though an access token is present
      this.refreshToken()
        .then(async () => {
          try {
            const profile = await this.getProfile();
            this.profile = profile;
          } catch (e) {
            console.log("Error getting profile info from ImsAuthService", e);
          }
        })
        .catch((e) => {
          console.log("Error getting refreshed token from ImsAuthService", e);
        });
    }

    this.onAccessTokenReceived?.(data);
  }

  /**
   * Function used to trigger the re-auth access token
   * @param data ITokenInformation object
   */
  /* istanbul ignore next */
  private onReAuthAccessToken(data) {
    this.imsToken = data?.token;
    this.onAccessTokenReceived?.(data);
  }

  /**
   * IMS callback for the 'onReady' event.
   */
  /* istanbul ignore next */
  private async onReady() {
    if (!this.isSignedInUser()) {
      await this.onAccessTokenHasExpired();
    }
  }

  /**
   * IMS callback for onAccessTokenHasExpired
   * Re-trigger signIn flow if it's expired.
   */
  /* istanbul ignore next */
  private async onAccessTokenHasExpired() {
    this.onAccessTokenExpired?.();
  }

  /**
   * IMS callback for onError
   */
  /* istanbul ignore next */
  private onError(type, message) {
    this.onErrorReceived?.(type, message);
  }
}

declare global {
  interface Window {
    assistantAuthService: ImsAuthService;
  }
}

/**
 * Ims Service registration. This is a required steps for the AssetSelector to work with IMS.
 * Must call this function on-load before you can renderAssetSelectorWithAuthFlow(...)
 * @param props - ImsAuthProps containing at least the following required parameters (imsClientId, imsScope, redirectUrl) for the IMS service.
 * @param forceRenew - If true, will create a new instance of the ImsAuthService even if one already exists.
 * @returns ImsAuthService
 */
export const getImsAuthService = (
  imsAuthProps: Partial<ImsAuthProps>,
  forceRenew = false
) => {
  let currentImsTokenService = window?.assistantAuthService;
  // we should check if currentImsTokenService clientId, scope, redirectUrl, and env has changed
  // if it did, we should forceRenew the service
  if (!currentImsTokenService || forceRenew) {
    // If the window doesn't already have an instance of the service, create one
    currentImsTokenService = ImsAuthService.getInstance(
      imsAuthProps,
      forceRenew
    );
    currentImsTokenService.initialize();
    window.assistantAuthService = currentImsTokenService;
  }
  return currentImsTokenService;
};
