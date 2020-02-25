import React from 'react'
import { observer } from 'mobx-react-lite'
import { useFieldContext } from '../../dist'
import { Checkbox as ReakitCheckbox } from 'reakit'

export const Checkbox = observer(props => {
    const { name, value, onCheckedChange } = useFieldContext()
    return (
        <ReakitCheckbox
            checked={value}
            name={name}
            onChange={onCheckedChange}
            {...props}
        />
    )
})
