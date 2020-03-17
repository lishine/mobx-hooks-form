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

const scheme = yup.object({
	publisher: yup
		.mixed()
		.transform(obj => {
			return obj?.name || null
		})
		.required('Publisher is required'),
	uiName: yup.string().required('Name is required'),
	reportId: yup.string().required('Looker report id is required'),
	icon: yup.string().required('Icon is required'),
	enabled: yup.boolean(),
	description: yup.string(),
	checkFieldName: yup.boolean().oneOf([true]),
})

const initialValues = {
	publisher: { name: 'selected' },
	uiName: '',
	reportId: '',
	enabled: true,
	description: '',
	icon: 'fa-file-chart-line',
	checkFieldName: true,
}

const WrapField = observer(({ name, children, label }) => {
	const { isRequired, error, id } = useField(name)
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
	const formStore = useForm({ initialValues, scheme, name: 'formName' })
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
									<FieldContextProvider name="enabled">
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
								<FieldContextProvider name="publisher">
									{fieldContext => (
										<WrapField name="publisher" label="Publisher:">
											<Lookahead
												placeholder="Select publisher"
												{...fieldContext}
											/>
										</WrapField>
									)}
								</FieldContextProvider>
								<WrapField name="checkFieldName" label="Check Field">
									<Checkbox sx={{ ml: 2 }} name="checkFieldName" />
								</WrapField>
								<WrapField name="reportId" label="Report ID:">
									<Input name="reportId" type="string" />
								</WrapField>
								<WrapField name="uiName" label="Name:">
									<Input name="uiName" autoComplete="off" />
								</WrapField>
								<WrapField name="description" label="Description:">
									<Input name="description" />
								</WrapField>
								<WrapField name="icon" label="Icon:">
									<div
										sx={{
											display: 'flex',
											grid: 'auto-flow / 300px auto',
											gap: 1,
										}}
									>
										<Input name="icon" />
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
