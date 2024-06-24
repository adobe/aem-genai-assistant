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
  app: {
    name: {
      defaultMessage: 'Generate Variations',
      id: 'app.name',
      description: 'Name of app',
    },
    description: {
      defaultMessage: 'Create high quality content quickly then measure it with experimentation or publish it to your site.',
      id: 'app.description',
      description: 'Description of app',
    },
    promptTemplatesLibraryPanelLabel: {
      defaultMessage: 'Prompt Templates',
      id: 'app.promptTemplatesLibraryPanelLabel',
      description: 'Label for Prompt Templates library panel',
    },
    noAccessDialogHeading: {
      defaultMessage: 'Access Denied',
      id: 'app.noAccessDialogHeading',
      description: 'Heading for no access dialog',
    },
    noAccessDialogContent: {
      defaultMessage: 'You have no access to this product',
      id: 'app.noAccessDialogContent',
      description: 'Content for no access dialog',
    },
    deletePromptTemplateButtonLabel: {
      defaultMessage: 'Delete',
      id: 'app.deletePromptTemplateButtonLabel',
      description: 'Label for Delete prompt template button',
    },
    deletePromptTemplateFailedToast: {
      defaultMessage: 'Failed to delete prompt template',
      id: 'app.deletePromptTemplateFailedToast',
      description: 'Toast message for failed prompt template deletion',
    },
    deletePromptTemplateQuestion: {
      defaultMessage: 'Are you sure you want to delete this prompt?',
      id: 'app.deletePromptTemplateQuestion',
      description: 'Question for deleting a prompt template',
    },
    deleteActionTitle: {
      defaultMessage: 'Delete',
      id: 'app.deleteActionTitle',
      description: 'Title for Delete action',
    },
    deleteActionLabel: {
      defaultMessage: 'Delete',
      id: 'app.deleteActionLabel',
      description: 'Label for Delete action',
    },
    cancelActionLabel: {
      defaultMessage: 'Cancel',
      id: 'app.cancelActionLabel',
      description: 'Label for Cancel action',
    },
    errorOccurredWhileGeneratingResults: {
      defaultMessage: 'An error occurred while generating results',
      id: 'app.errorOccurredWhileGeneratingResults',
      description: 'Error message for generating results',
    },
    errorOccurredWhileSendingFeedback: {
      defaultMessage: 'An error occurred while sending feedback',
      id: 'app.errorOccurredWhileSendingFeedback',
      description: 'Error message for sending feedback',
    },
    genAIContentManagementPolicyFilteredResults: {
      defaultMessage: 'The response was filtered due to the prompt triggering Generative AI\'s content management policy. Please modify your prompt and retry.',
      id: 'app.genAIContentManagementPolicyFilteredResults',
      description: 'Error message for response filtered by GenAI Content Management',
    },
    requestTimeout: {
      defaultMessage: 'Generative AI\'s request timed out. Please try again by reducing the number of variations.',
      id: 'app.requestTimeout',
      description: 'Error message for request timeout',
    },
    rateLimitExceeded: {
      defaultMessage: 'Generative AI\'s rate limit exceeded. Please wait one minute and try again.',
      id: 'app.rateLimitExceeded',
      description: 'Error message for rate limit exceeded',
    },
    invalidAccessToken: {
      defaultMessage: 'The access token is not valid',
      id: 'app.invalidAccessToken',
      description: 'Error message for an invalid access token',
    },
    missingAccessToken: {
      defaultMessage: 'The access token is not provided',
      id: 'app.missingAccessToken',
      description: 'Error message for when the access token is not provided',
    },
    profileFetchFailed: {
      defaultMessage: 'Failed to fetch profile',
      id: 'app.profileFetchFailed',
      description: 'Error message for a failed profile fetch',
    },
    noProductAccess: {
      defaultMessage: 'Profile does not have access to the product',
      id: 'app.noProductAccess',
      description: 'Error message for when the profile has no access to the product',
    },
    consentDialogHeading: {
      defaultMessage: 'Generative AI in Adobe apps',
      id: 'app.consentDialogHeading',
      description: 'Heading for consent dialog',
    },
    consentDialogContent: {
      defaultMessage: '<p>You can create in new ways with generative AI technology.</p><p>By clicking "Agree", you agree to {legalTermsLink}, and the following:</p><ul><li>Any prompts, context, or supplemental information, or other input you provide to this feature (a) must be tied to specific context, which can include your branding materials, website content, data, schemas for such data, templates, or other trusted documents, and (b) must not contain any personal information (personal information includes anything that can be linked back to a specific individual).</li><li>You should review any output from this feature for accuracy and ensure that it is appropriate for your use case.</li></ul>',
      id: 'app.consentDialogContent',
      description: 'Content for consent dialog',
    },
    noAccessMessage: {
      defaultMessage: 'To use <strong>Generate Variations</strong> you must agree to the Generative AI User Guidelines.{newLine}Refresh this page to <strong>Agree</strong>.',
      id: 'app.noAccessMessage',
      description: 'Message for users who have not agreed to the Generative AI User Guidelines',
    },
    consentDialogAgreeButtonLabel: {
      defaultMessage: 'Agree',
      id: 'app.consentDialogAgreeButtonLabel',
      description: 'Label for consent dialog Agree button',
    },
    consentDialogCancelButtonLabel: {
      defaultMessage: 'Cancel',
      id: 'app.consentDialogCancelButtonLabel',
      description: 'Label for consent dialog Cancel button',
    },
    unexpectedErrorEncountered: {
      defaultMessage: 'Oops! We\'ve encountered an unexpected error. Please try again later.',
      id: 'app.unexpectedErrorEncountered',
      description: 'Default error message for wretch with options calls',
    },
    accessBoundaryNoAccessMessage: {
      defaultMessage: 'Apologies, it appears that you lack permission to use this feature.{newLine}Please try selecting a different organization or contact your Administrator to request access.',
      id: 'app.accessBoundaryNoAccessMessage',
      description: 'Message for users who do not have access to the product',
    },
  },
};
