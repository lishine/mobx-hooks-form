/** @jsx jsx */
import { jsx } from 'theme-ui'
import { useCallback, useState } from 'react'
import Switch from 'react-bootstrap-switch'
import { Form, Row, Col, Label, FormGroup } from 'reactstrap'
import { Observer, observer } from 'mobx-react-lite'
import * as yup from 'yup'
import { ThemeProvider } from 'theme-ui'
import cs from 'classnames'

// Common
import { Input } from './components/Input'
import { useForm, FormContextProvider, FieldContextProvider, useField } from '../../dist'
import { sleep } from './utils'

// Local
import { Lookahead } from './components/Lookahead'
import { Icon } from './components/Icon'
import { theme } from './theme'

import 'react-bootstrap-switch/dist/css/bootstrap3/react-bootstrap-switch.min.css'
import './app.css'
import { SubmitButton } from './components/SubmitButton'
import { Checkbox } from './components/Checkbox'
import { Ars } from './components/ars'

const schema = yup.object({
	publisher: yup
		.mixed()
		.transform(obj => {
			return obj?.name || null
		})
		.required('Publisher is required'),
	uiName: yup.string().required('Name is required'),
	reportId: yup.string().required('Report id is required'),
	icon: yup.string().required('Icon is required'),
	enabled: yup.boolean(),
	d: yup.object({
		description: yup.string(),
	}),
	checkFieldName: yup
		.boolean()
		.oneOf([true], 'checkFieldName is required')
		.required(),
})

const defaultValues = {
	publisher: { name: 'selected' },
	uiName: '',
	reportId: '',
	enabled: true,
	description: '',
	icon: 'fa-file-chart-line',
	checkFieldName: true,
	ars: [1, 2, 3],
}

const WrapField = observer(({ path, children, label }) => {
	const { isRequired, error, id } = useField(path)
	return (
		<Row sx={{ mb: '1em' }}>
			<Col>
				<FormGroup>
					<Label for={id} className={cs(isRequired && 'requiredNoClash')}>
						{label}
					</Label>
					{children}
					<div sx={{ position: 'absolute', color: 'error' }}>{error}</div>
				</FormGroup>
			</Col>
		</Row>
	)
})

export const App = () => {
	const formStore = useForm({ defaultValues, schema, formName: 'formName' })
	const [isSubmitting, setIsSubmitting] = useState(false)

	console.log('rendering App')

	const submit = useCallback(async () => {
		setIsSubmitting(true)
		await sleep(10000)
		setIsSubmitting(false)
	}, [])

	return (
		<Observer>
			{() => {
				console.log('rendering App-Component')
				return (
					<ThemeProvider theme={theme}>
						<FormContextProvider formStore={formStore}>
							<Form
								sx={{ mx: 'auto', width: 400 }}
								onSubmit={formStore.handleSubmit(submit)}
							>
								<div sx={{ mt: 2, mb: 5 }}>
									<FieldContextProvider path="enabled">
										{({ value, setValue }) => {
											console.log('rendering Switch')

											return (
												<Switch
													onChange={(e, status) =>
														setValue(status)
													}
													name="enabled"
													onText="Enabled"
													onColor="success"
													offText="Disabled"
													value={value}
												/>
											)
										}}
									</FieldContextProvider>
								</div>
								<FieldContextProvider path="publisher">
									{fieldContext => (
										<WrapField path="publisher" label="Publisher:">
											<Lookahead
												placeholder="Select publisher"
												{...fieldContext}
											/>
										</WrapField>
									)}
								</FieldContextProvider>
								<WrapField path="checkFieldName" label="Check Field">
									<Checkbox sx={{ ml: 2 }} path="checkFieldName" />
								</WrapField>
								<WrapField path="ars" label="Array">
									<Ars sx={{}} path="ars" />
								</WrapField>
								<WrapField path="reportId" label="Report ID:">
									<Input path="reportId" type="string" />
								</WrapField>
								<WrapField path="uiName" label="Name:">
									<Input path="uiName" autoComplete="off" />
								</WrapField>
								<WrapField path="d.description" label="Description:">
									<Input path="d.description" />
								</WrapField>
								<WrapField path="icon" label="Icon:">
									<div
										sx={{
											display: 'flex',
											grid: 'auto-flow / 300px auto',
											gap: 1,
										}}
									>
										<Input path="icon" />
										<Icon value={formStore.getValue('icon')} />
									</div>
								</WrapField>
								<SubmitButton isLoading={isSubmitting}>Save</SubmitButton>
							</Form>
						</FormContextProvider>
					</ThemeProvider>
				)
			}}
		</Observer>
	)
}
