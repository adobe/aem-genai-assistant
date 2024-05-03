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
import {
  Flex, Grid, View, Text, Image, Link,
} from '@adobe/react-spectrum';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { css } from '@emotion/css';
import { useIntl } from 'react-intl';

import { intlMessages } from './Favorites.l10n.js';
import { favoritesState } from '../state/FavoritesState.js';
import { FavoriteVariantCard } from './FavoriteVariantCard.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import ChevronLeft from '../assets/chevron-left.svg';

const styles = {
  breadcrumbsLink: css`
    display: flex;
    color: var(--alias-content-neutral-subdued-default, var(--alias-content-neutral-subdued-default, #464646));
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
  `,
};

export function FavoriteVariantListPanel(props) {
  const favorites = useRecoilValue(favoritesState);
  const [viewType, setViewType] = useRecoilState(viewTypeState);

  const { formatMessage } = useIntl();

  return (
    <>
      <Flex UNSAFE_style={{ padding: '20px 20px 20px' }} direction={'row'} justifyContent={'left'} alignItems={'center'} gridArea={'breadcrumbs'}>
        <Link href="#" onPress={() => setViewType(ViewType.NewSession)} UNSAFE_className={styles.breadcrumbsLink}>
          <Image src={ChevronLeft} alt={'Back'} width={'24px'} />
          {formatMessage(intlMessages.favoritesView.navigationLabel)}
        </Link>
      </Flex>
      <View
        paddingStart={'size-400'}
        paddingEnd={'size-400'}
        height={'calc(100% - 90px)'}
        overflow={'auto'}>

        <Grid
          width={'100%'}
          alignItems={'start'}
          rows={'repeat(auto-fill, minmax(200px, 1fr))'}
          columns={'repeat(auto-fill, minmax(350px, 1fr))'} gap={'size-200'}>
          {favorites.length === 0
            ? <Text>{formatMessage(intlMessages.favoritesView.noFavoritesMessage)}</Text>
            : favorites.map((variant) => <FavoriteVariantCard key={variant.id} variant={variant} />)}
        </Grid>
      </View>
    </>
  );
}
