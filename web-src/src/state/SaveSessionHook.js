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
import { useRecoilCallback } from 'recoil';
import { sessionState } from './SessionState.js';
import { sessionsState } from './SessionsState.js';

export function useSaveSession() {
  return useRecoilCallback(({ snapshot, set }) => async () => {
    const currentSession = await snapshot.getPromise(sessionState);
    const sessions = await snapshot.getPromise(sessionsState);
    const existingSession = sessions.find((session) => session.id === currentSession.id);
    if (existingSession) {
      set(sessionsState, sessions.map((session) => {
        return (session.id === currentSession.id ? currentSession : session);
      }));
    } else {
      set(sessionsState, [...sessions, currentSession]);
    }
  }, []);
}
