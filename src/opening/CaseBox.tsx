import type { Grade } from '../deal/types.ts'

interface CaseBoxProps {
  grade: Grade
  /** Spoken name of the button, for example «Редкий кейс». */
  label: string
  onTap: () => void
}

/** The closed case the child taps to start the reel. Drawn in CSS, coloured by grade. */
export function CaseBox({ grade, label, onTap }: CaseBoxProps) {
  return (
    <button type="button" className="case-box" data-testid="case" data-grade={grade} aria-label={label} onClick={onTap}>
      <span className="case-box__lid" />
      <span className="case-box__body" />
      <span className="case-box__lock" />
    </button>
  )
}
