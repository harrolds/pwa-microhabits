import { closeSheet } from '@app/controllers/sheetController'

export default function ChangelogSheet() {
  return (
    <section>
      <h3>Bottom sheet</h3>
      <p>Sheets provide transient, high-emphasis surfaces for tasks.</p>
      <button type="button" onClick={closeSheet}>
        Close sheet
      </button>
    </section>
  )
}

