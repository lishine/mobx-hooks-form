import React from 'react'
import { Input as BSInput } from 'reactstrap'
import { useFieldContext } from '../../dist'

export const Input = props => {
    const { name, value, error, onBlur, onChange, id } = useFieldContext()
    return (
        <BSInput
            id={id}
            invalid={!!error}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
        />
    )
}
