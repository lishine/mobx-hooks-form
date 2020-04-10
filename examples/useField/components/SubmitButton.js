import React from 'react'
import { observer } from 'mobx-react-lite'
import { Button } from './Button'
import { useFormContext } from '../../../dist'

export const SubmitButton = observer((props) => {
  const { isValid } = useFormContext()

  console.log(`rendering submit button`)
  return <Button type='submit' disabled={!isValid} {...props} />
})
