/** @jsx jsx */
import { jsx } from 'theme-ui'
import { observer } from 'mobx-react-lite'
import { useFieldArray } from '../../../dist'
import { Input } from './Input'
import { Button } from './Button'

export const Ars = observer(props => {
	const { values, add, remove } = useFieldArray(props.path)

	console.log(`rendering ${props.path}`)
	return (
		<div>
			{values.map((v, i) => (
				<div key={i} sx={{ mb: 2, display: 'flex' }}>
					<Input path={`${props.path}[${i}]`} type="string" />
					<Button sx={{ ml: 2 }} onClick={() => remove(i)}>
						Remove
					</Button>
				</div>
			))}
			<Button onClick={() => add()}>Add</Button>
		</div>
	)
})
