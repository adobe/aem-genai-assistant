/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import React, { Fragment, useEffect } from 'react';
import { Well } from '@adobe/react-spectrum';
import { css } from '@emotion/css';
import { useShellContext } from './ShellProvider.js';

const styles = {
  container: css`
    display: block;
    border: 1px solid;
    border-radius: 5px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 25px;
    text-align: center;
  `,
};

export function AccessBoundary({ children }) {
  const { isUserAuthorized, closeOverlay } = useShellContext();

  useEffect(() => {
    if (!isUserAuthorized) {
      closeOverlay();
    }
  }, [isUserAuthorized]);

  if (!isUserAuthorized) {
    return (
      <Well UNSAFE_className={styles.container}>
        Oops it looks like you dont have access to this feature. Please ask you Administrator to give you access !
      </Well>
    );
  }

  return (<>{children}</>);
}
