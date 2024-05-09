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
import { css } from '@emotion/css';
import { useShellContext } from './ShellProvider.js';

const styles = {
  container: css`
    display: block;
    border: 1px solid #ccc;
    border-radius: 5px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 25px;
    text-align: center;
  `,
};

function NoAccessMessage() {
  return (
    <div className={styles.container}>
      Apologies, it appears that you lack permission to use this feature.<br/>
      Please try selecting a different organization or contact your Administrator to request access.
    </div>
  );
}

export function AccessBoundary({ children, fallback = <NoAccessMessage /> }) {
  const { isUserAuthorized, featureFlagsService, done } = useShellContext();
  const [isEarlyAccessAuthorized, setIsEarlyAccessAuthorized] = React.useState(false);

  useEffect(() => {
    if (featureFlagsService) {
      if (featureFlagsService.isEnabled(process.env.FT_EARLY_ACCESS) === 'true') {
        setIsEarlyAccessAuthorized(true);
      }
    }
  }, [featureFlagsService]);

  useEffect(() => {
    if (!(isUserAuthorized || isEarlyAccessAuthorized)) {
      done();
    }
  }, [isUserAuthorized, isEarlyAccessAuthorized, done]);

  if (!(isUserAuthorized || isEarlyAccessAuthorized)) {
    return fallback;
  }

  return (<>{children}</>);
}
