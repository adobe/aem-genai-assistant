/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export const intlMessages = {
  promptSessionSideView: {
    navigationLabel: {
      defaultMessage: 'Prompt Templates',
      id: 'promptSessionSideView.navigationLabel',
      description: 'Navigation label for Prompt Session side view',
    },
    inputsLabel: {
      defaultMessage: 'Inputs',
      id: 'promptSessionSideView.inputsLabel',
      description: 'Inputs label for Prompt Session side view',
    },
    advancedLabel: {
      defaultMessage: 'Advanced',
      id: 'promptSessionSideView.advancedLabel',
      description: 'Advanced label for Prompt Session side view',
    },
    temperatureLabel: {
      defaultMessage: 'Temperature',
      id: 'promptSessionSideView.temperatureLabel',
      description: 'Temperature label for Prompt Session side view',
    },
    temperatureDescription: {
      defaultMessage: 'A higher temperature strays from the prompt and leads to more randomness and creativity',
      id: 'promptSessionSideView.temperatureDescription',
      description: 'Temperature description for Prompt Session side view',
    },
    editPromptButtonLabel: {
      defaultMessage: 'Edit Prompt',
      id: 'promptSessionSideView.editPromptButtonLabel',
      description: 'Label for Edit prompt button',
    },
    savePromptButtonLabel: {
      defaultMessage: 'Save Prompt',
      id: 'promptSessionSideView.savePromptButtonLabel',
      description: 'Label for Save prompt button',
    },
    saveActionLabel: {
      defaultMessage: 'Save',
      id: 'promptSessionSideView.saveActionLabel',
      description: 'Label for Save action',
    },
    deleteActionLabel: {
      defaultMessage: 'Delete',
      id: 'promptSessionSideView.deleteActionLabel',
      description: 'Label for Delete action',
    },
    cancelActionLabel: {
      defaultMessage: 'Cancel',
      id: 'promptSessionSideView.cancelActionLabel',
      description: 'Label for Cancel action',
    },
    resetInputsButtonLabel: {
      defaultMessage: 'Reset Inputs',
      id: 'promptSessionSideView.resetInputsButtonLabel',
      description: 'Label for Reset inputs button',
    },
    generateButtonLabel: {
      defaultMessage: 'Generate',
      id: 'promptSessionSideView.generateButtonLabel',
      description: 'Label for Generate button',
    },
    generateButtonContextualInfoHeading: {
      defaultMessage: 'Terms of use',
      id: 'promptSessionSideView.generateButtonContextualHelpHeading',
      description: 'Heading for Generate button contextual info',
    },
    generateButtonContextualInfoContent: {
      defaultMessage: '<p>Access to this feature is subject to your agreement to the {legalTermsLink}, and the following:</p><ul><li>Any prompts, context, or supplemental information, or other input you provide to this feature (a) must be tied to specific context, which can include your branding materials, website content, data, schemas for such data, templates, or other trusted documents, and (b) must not contain any personal information (personal information includes anything that can be linked back to a specific individual).</li><li>You should review any output from this feature for accuracy and ensure that it is appropriate for youruse case.</li></ul>',
      id: 'promptSessionSideView.generateButtonContextualHelpContent',
      description: 'Content for Generate button contextual info',
    },
    legalTermsLinkName: {
      defaultMessage: 'Adobe Experience Cloud Generative AI User Guidelines',
      id: 'promptSessionSideView.legalTermsLinkName',
      description: 'Link name for Legal terms',
    },
    savePromptInstructionsLabel: {
      defaultMessage: 'Enter a new name to create a new prompt, or select an existing one from the list to update it.',
      id: 'promptSessionSideView.savePromptInstructionsLabel',
      description: 'Label for instructions to save a new prompt',
    },
    savePromptNameLabel: {
      defaultMessage: 'Prompt Name',
      id: 'promptSessionSideView.savePromptNameLabel',
      description: 'Label for saving prompt name',
    },
    savePromptDescriptionLabel: {
      defaultMessage: 'Description',
      id: 'promptSessionSideView.savePromptDescriptionLabel',
      description: 'Label for saving prompt description',
    },
    savePromptSharedSwitchLabel: {
      defaultMessage: 'Shared across organization',
      id: 'promptSessionSideView.savePromptSharedSwitchLabel',
      description: 'Switch label for sharing across organization',
    },
    savePromptSuccessToast: {
      defaultMessage: 'Prompt template saved',
      id: 'promptSessionSideView.savePromptSuccessToast',
      description: 'Toast message for successful Prompt Template save',
    },
    savePromptFailureToast: {
      defaultMessage: 'Error saving prompt template',
      id: 'promptSessionSideView.savePromptFailureToast',
      description: 'Toast message for failed Prompt Template save',
    },
    promptEditorContextualInfoContent: {
      defaultMessage: 'When editing the prompt directly, include specific context, which can include your branding materials, website content, data schemas for such data, templates, and other trusted documents.',
      id: 'promptSessionSideView.promptEditorContextualInfoContent',
      description: 'Content for Prompt Editor contextual info',
    },
    previewButtonLabel: {
      defaultMessage: 'Preview',
      id: 'promptSessionSideView.previewButtonLabel',
      description: 'Label for Preview button',
    },
    promptEditorViewTitle: {
      defaultMessage: 'Prompt and Trusted Source Documents',
      id: 'promptSessionSideView.promptEditorViewTitle',
      description: 'Title for Prompt ditor view',
    },
    audienceSelectorLoadCsvFailedToast: {
      defaultMessage: 'Failed to parse CSV',
      id: 'promptSessionSideView.audienceSelectorLoadCsvFailedToast',
      description: 'Toast message for failed CSV parsing',
    },
    audienceSelectorLoadTargetFailedToast: {
      defaultMessage: 'Failed to load from Adobe Target',
      id: 'promptSessionSideView.audienceSelectorLoadTargetFailedToast',
      description: 'Toast message for failed Adobe Target loading',
    },
    variationsGeneration15SecondsDelayToast: {
      defaultMessage: 'Thanks for your patience. We are still working on your request.',
      id: 'promptSessionSideView.variationsGeneration15SecondsDelayToast',
      description: 'This toast message notifies customers that their request is still in progress after 15 seconds of waiting.',
    },
    variationsGeneration30SecondsDelayToast: {
      defaultMessage: 'Your request is taking a bit longer than expected. We appreciate your patience as we continue to process it.',
      id: 'promptSessionSideView.variationsGeneration30SecondsDelayToast',
      description: 'This toast message informs customers that their request is experiencing a delay after 30 seconds of waiting.',
    },
    variationsGeneration60SecondsDelayToast: {
      defaultMessage: 'We apologize for the delay. Rest assured, we are actively working on your request and will have it completed soon.',
      id: 'promptSessionSideView.variationsGeneration60SecondsDelayToast',
      description: 'This toast message apologizes to customers for a prolonged delay in processing their request after 60 seconds.',
    },
    variationsGenerationLongDelayToast: {
      defaultMessage: 'We apologize for the extended delay and acknowledge the value of your time. We are actively working to ensure the completion of your request as quickly as possible.',
      id: 'promptSessionSideView.variationsGenerationLongDelayToast',
      description: 'This toast message acknowledges a significant delay in processing a customer\'s request.',
    },
  },
};
