import React from 'react'
import { useFieldContext } from '../../dist'
import { Checkbox as ReakitCheckbox } from 'reakit'

export const Checkbox = (props) => {
  const { name, value, onCheckedChange } = useFieldContext()

  console.log(`rendering ${name}`)
  return <ReakitCheckbox checked={value} name={name} onChange={onCheckedChange} {...props} />
}
