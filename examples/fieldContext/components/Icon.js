/** @jsx jsx */
import { jsx } from 'theme-ui'

export const Icon = ({ value }) => (
  <div sx={{ textAlign: 'center' }}>
    <i className={`fa fa-fw ${value}`} sx={{ mt: '6px', fontSize: '1.75em' }} />
  </div>
)
