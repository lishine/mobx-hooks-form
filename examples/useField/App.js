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
import { Button } from './components/Button'
import { Checkbox } from './components/Checkbox'
import { Ar } from './components/Ar'

const schema = yup.object({
  publisher: yup
    .mixed()
    .transform((obj) => {
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
  ars: yup
    .array()
    .of(yup.string().required())
    .max(1001)
    .required(),
})

const defaultValues = {
  publisher: { name: 'selected' },
  uiName: '',
  reportId: '',
  enabled: true,
  d: { description: '' },
  icon: 'fa-file-chart-line',
  checkFieldName: true,
  ars: { firstName: 'First Name', familyName: 'Family Name' },
  // ars: Array(1000).fill({
  // firstName: 'First Name',
  // familyName: 'Family Name',
  // }),
}

const WrapField = observer(({ path, children, label, ...props }) => {
  const { isRequired, error, id } = useField(path)
  return (
    <Row sx={{ mb: '1em' }} {...props}>
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

export const App = observer(() => {
  const formStore = useForm({
    defaultValues,
    schema,
    formName: 'formName',
    debug: true,
    // debugMobx: true,
  })

  console.log('rendering App')

  const submit = useCallback(async () => {
    await sleep(5000)
    throw Error('test error')
  }, [])
  console.log('formStore.error', formStore.error)

  console.log('rendering App-Component')
  return (
    <ThemeProvider theme={theme}>
      <FormContextProvider formStore={formStore}>
        <Form sx={{ mx: 'auto', width: 400 }} onSubmit={formStore.handleSubmit(submit)}>
          <div
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              mb: 3,
            }}
          >
            <SubmitButton>Submit</SubmitButton>
            <Button onClick={formStore.reset}>Reset</Button>
          </div>
          {/* <div sx={{ mt: 2, mb: 5 }}>
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
								</div> */}
          {/* <FieldContextProvider path="publisher">
									{fieldContext => (
										<WrapField path="publisher" label="Publisher:">
											<Lookahead
												placeholder="Select publisher"
												{...fieldContext}
											/>
										</WrapField>
									)}
								</FieldContextProvider> */}
          <WrapField path='checkFieldName' label='Check Field'>
            <Checkbox sx={{ ml: 2 }} path='checkFieldName' />
          </WrapField>
          <WrapField path='reportId' label='Report ID:'>
            <Input autoFocus path='reportId' type='string' />
          </WrapField>
          <WrapField path='uiName' label='Name:'>
            <Input path='uiName' autoComplete='off' />
          </WrapField>
          <WrapField path='d.description' label='Description:'>
            <Input path='d.description' />
          </WrapField>
          <WrapField path='icon' label='Icon:'>
            <div
              sx={{
                display: 'flex',
                grid: 'auto-flow / 300px auto',
                gap: 1,
              }}
            >
              <Input path='icon' />
              <Icon value={formStore.getValue('icon')} />
            </div>
          </WrapField>
          <WrapField path='ars' label='Array' sx={{ mt: 2 }}>
            <Ar sx={{}} path='ars' />
          </WrapField>
        </Form>
      </FormContextProvider>
    </ThemeProvider>
  )
})
