import {useRecoilCallback} from 'recoil';
import {currentSessionState} from '../state/CurrentSessionState.js';
import {sessionsState} from '../state/SessionsState.js';

export function useSaveSessionCallback() {
  return useRecoilCallback(({snapshot, set}) => async () => {
    const currentSession = await snapshot.getPromise(currentSessionState);
    const sessions = await snapshot.getPromise(sessionsState);
    const existingSession = sessions.find(session => session.id === currentSession.id);
    if (existingSession) {
      set(sessionsState, sessions.map(session => session.id === currentSession.id ? currentSession : session));
    } else {
      set(sessionsState, [...sessions, currentSession]);
    }
  }, []);
}
