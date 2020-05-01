import React from 'react'
import { observer } from 'mobx-react-lite'
import { Input as BSInput } from 'reactstrap'
import { useField } from '../../../dist'

export const Input = observer((props) => {
  const { value, error, onBlur, onChange, id, submitting } = useField(props.path)

  console.log(`rendering ${props.path}`)
  return (
    <BSInput
      disabled={submitting}
      id={id}
      invalid={!!error}
      name={props.path}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      {...props}
    />
  )
})
