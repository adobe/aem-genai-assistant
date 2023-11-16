import {ActionButton, Tooltip, TooltipTrigger} from '@adobe/react-spectrum';
import ThumbUp from '@spectrum-icons/workflow/ThumbUp';
import ThumbDown from '@spectrum-icons/workflow/ThumbDown';
import Star from '@spectrum-icons/workflow/Star';
import StarOutline from '@spectrum-icons/workflow/StarOutline';
import Copy from '@spectrum-icons/workflow/Copy';
import Add from '@spectrum-icons/workflow/Add';
import Delete from '@spectrum-icons/workflow/Delete';
import React, {useCallback, useState} from 'react';
import {css} from '@emotion/css';
import {useIsFavorite} from '../state/IsFavoriteHook.js';
import {useToggleFavorite} from '../state/ToggleFavoriteHook.js';
import {useApplicationContext} from './ApplicationProvider.js';
import {ToastQueue} from '@react-spectrum/toast';

const styles = {
  card: css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin: 0 16px;
  `,
  promptSection: css`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
  `,
  promptContent: css`
    overflow: hidden;
    color: var(--alias-content-neutral-subdued-default, var(--alias-content-neutral-subdued-default, #464646));
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: Adobe Clean, serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
  `,
  promptActions: css`
  `,
  resultsSection: css`
    display: flex;
    padding: 16px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 16px;
    border-radius: 8px;
    border: 2px solid var(--palette-gray-200, #E6E6E6);
    background: var(--palette-gray-50, #FFF);
  `,
  variantsContainer: css`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: left;
    overflow: auto;
  `,
  variant: css`
    display: flex;
    width: 152px;
    height: 80px;
    padding: 8px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    border-radius: 8px;
    border: 1px solid var(--palette-gray-300, #D5D5D5);
    background: var(--palette-gray-50, #FFF);
    user-select: none;
    overflow: hidden;
    &:hover {
      border-color: var(--alias-content-semantic-accent-default, #0265DC);
    }
    `,
  variantSelected: css`
    border-bottom-width: 5px;
    `,
  variantFavorite: css`
    background-color: #fffff0;
  `,
  resultContent: css`
  `,
  resultActions: css`
  `,
}

export function ResultCard({resultId, variants, prompt, ...props}) {
  const { firefallService } = useApplicationContext();
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const isFavorite = useIsFavorite();
  const toggleFavorite = useToggleFavorite();

  const sendFeedback = useCallback((sentiment) => {
    firefallService.feedback(resultId, sentiment)
      .then((id) => {
        console.log('Feedback sent', id);
        ToastQueue.positive('Feedback sent', {timeout: 1000});
      })
      .catch((error) => {
        console.error('Failed to send feedback', error);
        ToastQueue.negative('Failed to send feedback', {timeout: 1000});
      });
  }, [resultId, firefallService]);

  return (
    <div {...props} className={styles.card}>

      <div className={styles.promptSection}>
        <p className={styles.promptContent}>{prompt}</p>
        <div className={styles.promptActions}>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Copy/>
            </ActionButton>
            <Tooltip>Copy</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Add/>
            </ActionButton>
            <Tooltip>Use</Tooltip>
          </TooltipTrigger>
        </div>
      </div>
      <div className={styles.resultsSection}>
        <div className={styles.variantsContainer}>
          {
            variants.map((variant) => {
              return (
                <a onClick={() => setSelectedVariant(variant)}>
                  <p className={css`
                    ${styles.variant};
                    ${variant.id === selectedVariant.id && styles.variantSelected};
                    ${isFavorite(variant) && styles.variantFavorite};
                  `}>
                    {variant.content}
                  </p>
                </a>
              )
            })
          }
        </div>
        <div className={styles.resultContent}>{selectedVariant.content}</div>
        <div className={styles.resultActions}>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => toggleFavorite(selectedVariant)}>
              {isFavorite(selectedVariant) ? <StarOutline/> : <Star/>}
            </ActionButton>
            <Tooltip>Save</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Copy/>
            </ActionButton>
            <Tooltip>Copy</Tooltip>
          </TooltipTrigger>
          <ActionButton
            isQuiet
            UNSAFE_className="hover-cursor-pointer"
            onPress={() => sendFeedback(true)}>
            <ThumbUp/>
          </ActionButton>
          <ActionButton
            isQuiet
            UNSAFE_className="hover-cursor-pointer"
            onPress={() => sendFeedback(false)}>
            <ThumbDown/>
          </ActionButton>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Delete/>
            </ActionButton>
            <Tooltip>Remove</Tooltip>
          </TooltipTrigger>
        </div>
      </div>
    </div>
  )
}
