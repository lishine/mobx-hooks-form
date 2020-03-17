import React from 'react'
import { observer } from 'mobx-react-lite'
import { Input as BSInput } from 'reactstrap'
import { useField } from '../../../dist'

export const Input = observer(props => {
	const { value, error, onBlur, onChange, id } = useField(props.name)

	console.log(`rendering ${props.name}`)
	return (
		<BSInput
			id={id}
			invalid={!!error}
			name={props.name}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			{...props}
		/>
	)
})
