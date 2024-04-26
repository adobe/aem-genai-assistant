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
  Flex, Grid, View, Text, Image, Link, ButtonGroup, AlertDialog, DialogTrigger, Button,
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
          <Image src={ChevronLeft} alt={'Back'} width={'24px'} />
          {formatMessage(intlMessages.favoritesView.navigationLabel)}
        </Link>
        <ButtonGroup marginStart={'auto'}>
          <Button
            key="exportCsv"
            variant="cta"
            onPress={exportCsv}
            isDisabled={selectedVariants.length === 0}>
            <ExportIcon />
            <Text>Export to CSV</Text>
          </Button>
          <Button
            key="selectAll"
            variant="secondary"
            onPress={selectAll}
            isSelected={selectedVariants.length === favorites.length}
            isDisabled={favorites.length === 0}>
            <SelectAllIcon />
            <Text>Select All</Text>
          </Button>
          <Button
            key="deselectAll"
            variant="secondary"
            onPress={deselectAll}
            isSelected={selectedVariants.length === 0}
            isDisabled={favorites.length === 0}>
            <DeselectAllIcon />
            <Text>Deselect All</Text>
          </Button>
          <DialogTrigger>
            <Button
              key="removeFromFavorites"
              variant="negative"
              isDisabled={selectedVariants.length === 0}>
              <RemoveFavoriteIcon />
              <Text>Delete</Text>
            </Button>
            <AlertDialog
              title="Remove from favorites"
              variant="confirmation"
              onPrimaryAction={removeFromFavorites}
              primaryActionLabel="Confirm"
              cancelLabel="Cancel">
              <Text>Are you sure you want to remove the selected variants from your favorites?</Text>
            </AlertDialog>
          </DialogTrigger>
        </ButtonGroup>
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
