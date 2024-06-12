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

import { findSyntaxError } from './PromptEditor.js';

describe('findSyntaxError', () => {
  it('empty prompt', () => {
    const prompt = '';
    expect(findSyntaxError(prompt)).toBe(false);
  });

  it('simple prompt with valid syntax', () => {
    const prompt = 'This is a valid prompt.';
    expect(findSyntaxError(prompt)).toBe(false);
  });

  it('prompt with valid syntax', () => {
    const prompt = `{{# -------------------------------------------------------------------------- }}
    {{# REQUIREMENTS                                                               }}
    {{# Specify any and all conditions your content must comply with to meet your  }}
    {{# brand writing guidelines.                                                  }}
    {{# -------------------------------------------------------------------------- }}
    Requirements: \`\`\`
    - The text must consist of three parts: a Title, a Body and an "AI Rationale".
    - The text must be brief, such that:
    * In 20 words (100 characters) or less, compose the "AI Rationale" text first and use it to explain your reasoning for composing the copy, before composing the other parts.
    * The Title text must not exceed 6 words or 30 characters, including spaces.
    * The Body text must not exceed 13 words or 65 characters, including spaces.
    - The tone of the text needs to be: {{tone_of_voice}}.
    - The product name must appear once either in the Title text or Body text.
    - Never abbreviate or shorten the name of the product in the text.
    - Compose the text without using the same adjective more than once.
    - Do not use exclamation marks or points at the end of sentences in the text.
    - Do not use exclamation marks or points in the text.
    - Format the response as an array of valid, iterable RFC8259 compliant JSON. Always list the "AI Rationale" attribute last.
    \`\`\`
    
    {{# -------------------------------------------------------------------------- }}
    {{# DOMAIN KNOWLEDGE AND TRUSTED SOURCE DOCUMENTS                              }}
    {{# Here you will Provide more background information or specific details to   }}
    {{# guide the creation of the content.                                         }}
    {{# -------------------------------------------------------------------------- }}
    Additional Context: [[
      {{domain_knowledge_and_trusted_source_documents}}
    ]]
    
    {{# -------------------------------------------------------------------------- }}
    {{# METADATA                                                                   }}
    {{# -------------------------------------------------------------------------- }}
    {{@explain_interaction,
      label="Explain user interaction",
      description="Elaborate on the user's interaction with the element, emphasizing the results and impacts of the interaction",
      default="the user is taken to a product page displaying a detailed view of our bestselling wireless headphones. Here, they can read product specifications, customer reviews, and make a purchase if they so choose",
      type=text
    }};`;

    expect(findSyntaxError(prompt)).toBe(false);
  });

  it('prompt with invalid syntax', () => {
    const prompt = `{{# -------------------------------------------------------------------------- }}
    {{# REQUIREMENTS                                                               }}
    {{# Specify any and all conditions your content must comply with to meet your  }}
    {{# brand writing guidelines.                                                  }}
    {{# -------------------------------------------------------------------------- }}
    Requirements: \`\`\`
    - The text must consist of three parts: a Title, a Body and an "AI Rationale".
    - The text must be brief, such that:
    * In 20 words (100 characters) or less, compose the "AI Rationale" text first and use it to explain your reasoning for composing the copy, before composing the other parts.
    * The Title text must not exceed 6 words or 30 characters, including spaces.
    * The Body text must not exceed 13 words or 65 characters, including spaces.
    - The tone of the text needs to be: {{tone_of_voice}}.
    - The product name must appear once either in the Title text or Body text.
    - Never abbreviate or shorten the name of the product in the text.
    - Compose the text without using the same adjective more than once.
    - Do not use exclamation marks or points at the end of sentences in the text.
    - Do not use exclamation marks or points in the text.
    - Format the response as an array of valid, iterable RFC8259 compliant JSON. Always list the "AI Rationale" attribute last.
    \`\`\`
    
    {{# -------------------------------------------------------------------------- }}
    {{# DOMAIN KNOWLEDGE AND TRUSTED SOURCE DOCUMENTS                              }}
    {{# Here you will Provide more background information or specific details to   }}
    {{# guide the creation of the content.                                         }}
    {{# -------------------------------------------------------------------------- }}
    Additional Context: [[
      {{domain_knowledge_and_trusted_source_documents}}
    ]]
    
    {{# -------------------------------------------------------------------------- }}
    {{# METADATA                                                                   }}
    {{# -------------------------------------------------------------------------- }}
    {{@explain_interaction,
      label="Explain user interaction",
      description="Elaborate on the user's interaction with the element, emphasizing the results and impacts of the interaction",
      default="the user is taken to a {product page displaying a detailed view of our bestselling wireless headphones. Here, they can read product specifications, customer reviews, and make a purchase if they so choose",
      type=text
    }};`;

    expect(findSyntaxError(prompt)).toBe(true);
  });

  it('prompt with invalid syntax', () => {
    const prompt = `{{# -------------------------------------------------------------------------- }}
    {{# REQUIREMENTS                                                               }}
    {{# Specify any and all conditions your content must comply with to meet your  }}
    {{# brand writing guidelines.                                                  }}
    {{# -------------------------------------------------------------------------- }}
    Requirements: \`\`\`
    - The text must consist of three parts: a Title, a Body and an "AI Rationale".
    - The text must be brief, such that:
    * In 20 words (100 characters) or less, compose the "AI Rationale" text first and use it to explain your reasoning for composing the copy, before composing the other parts.
    * The Title text must not exceed 6 words or 30 characters, including spaces.
    * The Body text must not exceed 13 words or 65 characters, including spaces.
    - The tone of the text needs to be: {{tone_of_voice}}.
    - The product name must appear once either in the Title text or Body text.
    - Never abbreviate or shorten the name of the product in the text.
    - Compose the text without using the same adjective more than once.
    - Do not use exclamation marks or points at the end of sentences in the text.
    - Do not use exclamation marks or points in the text.
    - Format the response as an array of valid, iterable RFC8259 compliant JSON. Always list the "AI Rationale" attribute last.
    \`\`\`
    
    {{# -------------------------------------------------------------------------- }}
    {{# DOMAIN KNOWLEDGE AND TRUSTED SOURCE DOCUMENTS                              }}
    {{# Here you will Provide more background information or specific details to   }}
    {{# guide the creation of the content.                                         }}
    {{# -------------------------------------------------------------------------- }}
    Additional Context: [[
      {{domain_knowledge_and_trusted_source_documents}}
    ]]
    
    {{# -------------------------------------------------------------------------- }}
    {{# METADATA                                                                   }}
    {{# -------------------------------------------------------------------------- }}
    {{@explain_interaction,
      label="Explain user interaction",
      description="Elaborate on the user's interaction with the element, emphasizing the results and impacts of the interaction",
      default="the user is taken to a {product page displaying a detailed view of our bestselling wireless headphones. Here, they can read product specifications, customer reviews, and make a purchase if they so choose",
      type=text
    }};`;

    expect(findSyntaxError(prompt)).toBe(true);
  });

  it('prompt with invalid syntax', () => {
    const prompt = `{{# -------------------------------------------------------------------------- }}
    {{# DOMAIN KNOWLEDGE AND TRUSTED SOURCE DOCUMENTS                              }}
    {{# Here you will Provide more background information or specific details to   }}
    {{# guide the creation of the content.                                         }}
    {{# -------------------------------------------------------------------------- }}
    Additional Context: [[
      {{domain_knowledge_and_trusted_source_documents}}
    ]]
    
    {{# -------------------------------------------------------------------------- }}
    {{# METADATA                                                                   }}
    {{# -------------------------------------------------------------------------- }}
    {{@explain_interaction,
      label="Explain user interaction",
      description="Elaborate on the user's interaction}} with the element, emphasizing the results and impacts of the interaction",
      default="the user is taken to a product page displaying a detailed view of our bestselling wireless headphones. Here, they can read product specifications, customer reviews, and make a purchase if they so choose",
      type=text
    }};`;

    expect(findSyntaxError(prompt)).toBe(true);
  });

  it('prompt with invalid syntax', () => {
    const prompt = `{{# -------------------------------------------------------------------------- }}
    {{# DOMAIN KNOWLEDGE AND TRUSTED SOURCE DOCUMENTS                              }}
    {{# Here you will Provide more background information or specific details to   }}
    {{# guide the creation of the content.                                         }}
    {{# -------------------------------------------------------------------------- }}
    Additional Context: [[
      {{domain_knowledge_and_trusted_source_documents}}
    ]]
    
    {{# -------------------------------------------------------------------------- }}
    {{# METADATA                                                                   }}
    {{# -------------------------------------------------------------------------- }}
    {{@explain_interaction,
      label="Explain user i"nteraction",
      description="Elaborate on the user's interaction with the element, emphasizing the results and impacts of the interaction",
      default="the user is taken to a product page displaying a detailed view of our bestselling wireless headphones. Here, they can read product specifications, customer reviews, and make a purchase if they so choose",
      type=text
    }};`;

    expect(findSyntaxError(prompt)).toBe(true);
  });
});
