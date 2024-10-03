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
  Flex,
  Grid,
  View,
  Text,
  Image,
  Link,
  AlertDialog,
  DialogTrigger,
  Tooltip,
  TooltipTrigger,
  ActionButton,
} from '@adobe/react-spectrum';
import React, { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { css } from '@emotion/css';
import { useIntl } from 'react-intl';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportIcon from '@spectrum-icons/workflow/Export';
import RemoveFavoriteIcon from '@spectrum-icons/workflow/Delete';
import SelectAllIcon from '@spectrum-icons/workflow/SelectBoxAll';
import DeselectAllIcon from '@spectrum-icons/workflow/Deselect';
import { intlMessages } from './Favorites.l10n.js';
import { favoritesState } from '../state/FavoritesState.js';
import { FavoriteVariantCard } from './FavoriteVariantCard.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import ChevronLeft from '../assets/chevron-left.svg';
import { formatIdentifier } from '../helpers/FormatHelper.js';
import { log, analytics } from '../helpers/MetricsHelper.js';

const DEFAULT_FILENAME = 'selected_variants.csv';

const styles = {
  breadcrumbsLink: css`
    display: flex;
    color: var(--alias-content-neutral-subdued-default, var(--alias-content-neutral-subdued-default, #464646));
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
  `,
};

export function exportToCsv(variants) {
  const filteredVariants = variants
    .map((variant) => variant.content)
    .map((content) => {
      const filteredContent = {};
      Object.keys(content).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
        console.log('normalizedKey', normalizedKey);
        if (normalizedKey !== 'airationale') {
          filteredContent[formatIdentifier(key)] = content[key];
        }
      });
      return filteredContent;
    });
  const csv = Papa.unparse(filteredVariants);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, DEFAULT_FILENAME);
}

export function FavoriteVariantListPanel(props) {
  const { formatMessage } = useIntl();
  const [favorites, setFavorites] = useRecoilState(favoritesState);
  const setViewType = useSetRecoilState(viewTypeState);
  const [selectedVariants, setSelectedVariants] = React.useState([]);

  const exportCsv = useCallback(() => {
    const variantsToExport = favorites.filter((variant) => selectedVariants.includes(variant.id));
    if (variantsToExport.length > 0) {
      log('favorites:export:csv', { numberOfVariants: variantsToExport.length });
      analytics({
        widget: {
          name: 'Favorite Variations',
          type: 'NA',
        },
        element: 'Export to CSV',
        elementId: 'favorites:export:csv',
        type: 'button',
        action: 'click',
      });
      exportToCsv(favorites, 'selected_variants.csv');
    }
  }, [favorites, selectedVariants]);

  const removeFromFavorites = useCallback(() => {
    setFavorites(favorites.filter((variant) => !selectedVariants.includes(variant.id)));
    setSelectedVariants([]);
  }, [favorites, selectedVariants]);

  const selectAll = useCallback(() => {
    setSelectedVariants(favorites.map((variant) => variant.id));
  }, [favorites]);

  const deselectAll = useCallback(() => {
    setSelectedVariants([]);
  }, []);

  const toggleVariantSelection = useCallback((variant) => {
    console.log('toggleVariantSelection', variant);
    setSelectedVariants((prevSelectedVariants) => {
      if (prevSelectedVariants.includes(variant.id)) {
        return prevSelectedVariants.filter((id) => id !== variant.id);
      }
      return [...prevSelectedVariants, variant.id];
    });
  }, [selectedVariants]);

  return (
    <>
      <Flex UNSAFE_style={{ padding: '20px 20px 20px' }} direction={'row'} justifyContent={'left'} alignItems={'center'} gridArea={'breadcrumbs'}>
        <Link href="#" onPress={() => setViewType(ViewType.NewSession)} UNSAFE_className={styles.breadcrumbsLink}>
          <Image src={ChevronLeft} alt={formatMessage(intlMessages.favoritesView.backButtonAltText)} width={'24px'} />
          {formatMessage(intlMessages.favoritesView.navigationLabel)}
        </Link>
        <Flex flexGrow={1} gap={'size-100'} marginStart={'size-200'} marginEnd={'size-100'} justifyContent={'space-between'}>
          <Flex gap={'size-200'}>
            <ActionButton
              key="selectAll"
              onPress={selectAll}
              isHidden={selectedVariants.length === favorites.length}>
              <SelectAllIcon />
              <Text>{formatMessage(intlMessages.favoritesView.selectAllButtonLabel)}</Text>
            </ActionButton>
            <ActionButton
              key="deselectAll"
              alignSelf={'end'}
              onPress={deselectAll}
              isHidden={selectedVariants.length === 0}>
              <DeselectAllIcon />
              <Text>{formatMessage(intlMessages.favoritesView.deselectAllButtonLabel)}</Text>
            </ActionButton>
          </Flex>
          <Flex gap={10}>
            <TooltipTrigger>
              <ActionButton
                key="exportCsv"
                onPress={exportCsv}
                isDisabled={selectedVariants.length === 0}>
                <ExportIcon />
                <Text>{formatMessage(intlMessages.favoritesView.exportToCSVButtonLabel)}</Text>
              </ActionButton>
              <Tooltip>{formatMessage(intlMessages.favoritesView.exportToCSVButtonTooltip)}</Tooltip>
            </TooltipTrigger>
            <DialogTrigger>
              <ActionButton
                key="removeFromFavorites"
                isDisabled={selectedVariants.length === 0}>
                <RemoveFavoriteIcon />
                <Text>{formatMessage(intlMessages.favoritesView.removeSelectedButtonLabel)}</Text>
              </ActionButton>
              <AlertDialog
                title={formatMessage(intlMessages.favoritesView.removeSelectedAlertTitle)}
                variant="confirmation"
                onPrimaryAction={removeFromFavorites}
                primaryActionLabel={formatMessage(intlMessages.favoritesView.removeSelectedAlertDeleteButtonLabel)}
                cancelLabel={formatMessage(intlMessages.favoritesView.removeSelectedAlertCancelButtonLabel)}>
                <Text>{formatMessage(intlMessages.favoritesView.removeSelectedAlertMessage)}</Text>
              </AlertDialog>
            </DialogTrigger>
          </Flex>
        </Flex>
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
            : favorites.map((variant) => {
              return <FavoriteVariantCard
                key={variant.id}
                variant={variant}
                isSelected={selectedVariants.includes(variant.id)}
                setSelected={() => toggleVariantSelection(variant)}
              />;
            })}
        </Grid>
      </View>
    </>
  );
}
