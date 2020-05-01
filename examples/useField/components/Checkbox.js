import React from 'react'
import { observer } from 'mobx-react-lite'
import { Checkbox as ReakitCheckbox } from 'reakit'
import { useField } from '../../../dist'

export const Checkbox = observer((props) => {
  const { value, onCheckedChange } = useField(props.path)

  console.log(`rendering ${props.path}`)
  return <ReakitCheckbox checked={value} name={props.path} onChange={onCheckedChange} {...props} />
})
