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
import {Item, Link} from '@adobe/react-spectrum';
import React, {useCallback, useEffect} from 'react';
import {useApplicationContext} from './ApplicationProvider.js';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {promptTemplatesState} from '../state/PromptTemplatesState.js';
import {promptTemplateState} from '../state/PromptTemplateState.js';
import {parseSpreadSheet} from '../helpers/SpreadsheetParser.js';

import './RailMenu.css';

const PROMPT_TEMPLATES_FILENAME = 'prompttemplates.json';

export function RailMenu() {
  const { websiteUrl } = useApplicationContext();
  const [promptTemplates, setPromptTemplates] = useRecoilState(promptTemplatesState);
  const setPrompt = useSetRecoilState(promptTemplateState);

  useEffect(() => {
    parseSpreadSheet(`${websiteUrl}/${PROMPT_TEMPLATES_FILENAME}`).then(setPromptTemplates);
  }, [websiteUrl, setPromptTemplates]);

  const promptSelectionHandler = useCallback((selected) => {
    setPrompt(promptTemplates[selected]);
  }, [promptTemplates, setPrompt]);

  return (
    <>
      {/*<ul className={'rail-menu__collection'}>*/}
      {/*  {promptTemplates ? promptTemplates*/}
      {/*    .map((template, index) => <li className={'rail-menu__item'} key={index}>{template.key}</li>) : []}*/}
      {/*</ul>*/}

      <nav>
        <ul className="spectrum-SideNav spectrum-SideNav--multiLevel">
          <li className="spectrum-SideNav-item">
            <a href="#" className="spectrum-SideNav-itemLink">
              <span className="spectrum-SideNav-link-text"> Section Title 1 for a Multilevel Side Nav</span>
            </a>
          </li>
          <li className="spectrum-SideNav-item">
            <a href="#" className="spectrum-SideNav-itemLink">
              <span className="spectrum-SideNav-link-text"> Section Title 2</span>
            </a>
            <ul className="spectrum-SideNav">
              <li className="spectrum-SideNav-item">
                <a href="#" className="spectrum-SideNav-itemLink">
                  <span className="spectrum-SideNav-link-text"> Section Title 1</span>
                </a>
              </li>
              <li className="spectrum-SideNav-item">
                <a href="#" className="spectrum-SideNav-itemLink">
                  <span className="spectrum-SideNav-link-text"> Section Title 2</span>
                </a>
                <ul className="spectrum-SideNav">
                  <li className="spectrum-SideNav-item">
                    <a href="#" className="spectrum-SideNav-itemLink">
                      <span className="spectrum-SideNav-link-text"> Section Title 1</span>
                    </a>
                  </li>
                  <li className="spectrum-SideNav-item">
                    <a href="#" className="spectrum-SideNav-itemLink">
                      <span className="spectrum-SideNav-link-text"> Section Title 2</span>
                    </a>
                  </li>
                </ul>
              </li>
              <li className="spectrum-SideNav-item">
                <a href="#" className="spectrum-SideNav-itemLink">
                  <span className="spectrum-SideNav-link-text"> Section Title 3</span>
                </a>
              </li>
            </ul>
          </li>
          <li className="spectrum-SideNav-item">
            <a href="#" className="spectrum-SideNav-itemLink">
              <span className="spectrum-SideNav-link-text"> Section Title 4</span>
            </a>
          </li>
          <li className="spectrum-SideNav-item">
            <a href="#" className="spectrum-SideNav-itemLink">
              <span className="spectrum-SideNav-link-text"> Section Title 5</span>
            </a>
          </li>
          <li className="spectrum-SideNav-item">
            <a href="#" className="spectrum-SideNav-itemLink">
              <span className="spectrum-SideNav-link-text"> Section Title 6</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
