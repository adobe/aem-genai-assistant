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

import { IAdobeIdData } from "@identity/imslib/adobe-id/IAdobeIdData";
import { ITokenInformation } from "@identity/imslib/adobe-id/custom-types/CustomTypes";
import { ImsAuthService } from "../components/ImsAuthService";

interface AdobeIdDataModalSettings {
  modalSettings?: {
    allowOrigin?: string;
  };
}

export type ImsAuthProps = {
  /**
   * IMS client ID that is registered for your app.
   */
  imsClientId: string;
  /**
   * IMS scopes that are registered for the above client ID.
   */
  imsScope: string;
  /**
   * IMS redirect URI that is allowed listed for the above client ID.
   */
  redirectUrl?: string;

  /**
   * Whether to use sign in flow in a popup modal or full page reload.
   */
  modalMode?: boolean;

  /**
   * The environment to use for the IMS library.
   */
  env?: string;

  /**
   * Whether to wait for the imsToken before rendering the child component.
   */
  waitForImsToken?: boolean;

  /**
   * The child component that will receive the imsToken as a prop.
   * Note: For performance reasons, we only inject the imsToken into the top level child.
   */
  children?: React.ReactElement;

  /**
   * Any additional options that need to be passed down to the Adobe IMS library.
   */
  adobeImsOptions?: Partial<IAdobeIdData & AdobeIdDataModalSettings>;

  /**
   * IMS callback for when the onAccessToken is completed
   * Useful when you want to make sure AssetSelector is only rendered after the token is received
   * @param data ITokenInformation object
   */
  onAccessTokenReceived?: (data: ITokenInformation) => void;

  /**
   * IMS callback for when there is an error
   * @param type error type
   * @param message error message
   */
  onErrorReceived?: (type, message) => void;

  /**
   * Invoked after ImsAuthService has been initialized.
   * This is the way for the parent component to get access to the ImsAuthService instance.
   * @param imsAuthService
   */
  onImsServiceInitialized?: (imsAuthService: ImsAuthService) => void;
};
