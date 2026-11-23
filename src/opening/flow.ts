/** Where the child is with the current case. */
export type Phase = 'case' | 'spinning' | 'revealed'

export interface FlowState {
  /** 0 for the door's main case, 1 for its bonus case. */
  caseIndex: number
  phase: Phase
  /** True once the last case has been collected. */
  done: boolean
}

export type FlowAction = 'tapCase' | 'reelStopped' | 'collect'

export const initialFlow: FlowState = { caseIndex: 0, phase: 'case', done: false }

/**
 * Advances the opening. An action that does not apply in the current phase
 * returns the same state object, so mashed taps have no effect.
 */
export function flowReducer(state: FlowState, action: FlowAction, caseCount: number): FlowState {
  if (state.done) return state
  if (action === 'tapCase' && state.phase === 'case') return { ...state, phase: 'spinning' }
  if (action === 'reelStopped' && state.phase === 'spinning') return { ...state, phase: 'revealed' }
  if (action === 'collect' && state.phase === 'revealed') {
    const next = state.caseIndex + 1
    return next < caseCount ? { caseIndex: next, phase: 'case', done: false } : { ...state, done: true }
  }
  return state
}
