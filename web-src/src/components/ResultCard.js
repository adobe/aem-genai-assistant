import {ActionButton, Tooltip, TooltipTrigger} from '@adobe/react-spectrum';
import ThumbUp from '@spectrum-icons/workflow/ThumbUp';
import ThumbDown from '@spectrum-icons/workflow/ThumbDown';
import Star from '@spectrum-icons/workflow/Star';
import Copy from '@spectrum-icons/workflow/Copy';
import Add from '@spectrum-icons/workflow/Add';
import Delete from '@spectrum-icons/workflow/Delete';
import React, {useState} from 'react';
import {css} from '@emotion/css';

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
  prompt: css`
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
    &[data-selected=true] {
      border-bottom-width: 5px;
    }
    &[data-favorite=true] {
      background-color: #fffff0;
    }
    &:hover {
      border-color: var(--alias-content-semantic-accent-default, #0265DC);
    }
  `,
  selectedVariant: css`
  `,
  selectedVariantActions: css`
  `,
}

export function ResultCard({variants, prompt, isFavorite, makeFavorite, ...props}) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  return (
    <div {...props} className={styles.card}>

      <div className={styles.promptSection}>
        <p className={styles.prompt}>{prompt}</p>
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
            <Tooltip>Remove</Tooltip>
          </TooltipTrigger>
        </div>
      </div>
      <div className={styles.resultsSection}>
        <div className={styles.variantsContainer}>
          {
            variants.map((variant) => {
              return (
                <a onClick={() => setSelectedVariant(variant)}>
                  <p className={styles.variant}
                     data-selected={variant.id === selectedVariant.id}
                     data-favorite={isFavorite(variant)}>
                    {variant.content}
                  </p>
                </a>
              )
            })
          }
        </div>
        <div className={styles.selectedVariant}>{selectedVariant.content}</div>
        <div className={styles.selectedVariantActions}>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => makeFavorite(selectedVariant)}
              isDisabled={isFavorite(selectedVariant)}>
              <Star/>
            </ActionButton>
            <Tooltip>Save</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Copy/>
            </ActionButton>
            <Tooltip>Copy to Clipboard</Tooltip>
          </TooltipTrigger>
          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
            <ThumbUp/>
          </ActionButton>
          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
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
