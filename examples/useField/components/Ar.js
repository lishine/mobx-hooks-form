/** @jsx jsx */
import { jsx } from 'theme-ui'
import { observer } from 'mobx-react-lite'
import { useFieldArray } from '../../../dist'
import { Input } from './Input'
import { Button } from './Button'

const DisabledCover = () => (
  <div
    sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'white',
      opacity: '70%',
      zIndex: 10,
    }}
  />
)

export const Ar = observer((props) => {
  const { add, remove } = useFieldArray(props.path)
  let { indexes } = useFieldArray(props.path)

  console.log(`rendering ${props.path}`)
  console.log('indexes.length', indexes.length)

  let empty
  if (indexes.length === 0) {
    indexes = [0]
    empty = true
  }
  return (
    <div>
      {indexes.map((i) => {
        let path = props.path
        if (!empty) {
          path = props.path + `[${i}]`
        }
        return (
          <div key={i} sx={{ mb: 2, display: 'flex', position: 'relative' }}>
            {empty && <DisabledCover />}
            <Input path={`${path}.firstName`} sx={{ mr: 2 }} />
            <Input path={`${path}.familyName`} />
            <Button sx={{ ml: 2 }} onClick={() => remove(i)}>
              Remove
            </Button>
          </div>
        )
      })}
      <Button onClick={() => add()}>Add</Button>
    </div>
  )
})
