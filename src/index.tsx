import React, { useContext } from 'react'
import { autorun, computed, action, observable } from 'mobx'
import { useLocalStore, observer } from 'mobx-react-lite'
import { isEmpty } from 'lodash'
import { pick } from 'lodash/fp'
import * as yup from 'yup'

function getErrorsFromValidationError(validationError: yup.ValidationError): Errors {
	const FIRST_ERROR = 0
	return validationError.inner.reduce((errors, error) => {
		return {
			...errors,
			[error.path]: error.errors[FIRST_ERROR],
		}
	}, {})
}

function validate(schema: yup.ObjectSchema<Values>, values: {}) {
	try {
		schema.validateSync(values, { abortEarly: false, recursive: true })
		return {}
	} catch (error) {
		return getErrorsFromValidationError(error)
	}
}

interface Values {
	[index: string]: yup.Schema<any>
}
interface Touched {
	[index: string]: boolean
}
interface Errors {
	[index: string]: string
}

interface UseForm {
	scheme: yup.ObjectSchema<Values>
	initialValues: Values
	name: string
}

class Store {
	constructor(props: UseForm) {
		const { scheme, initialValues, name = '' } = props
		this.scheme = scheme
		this.formName = name
		this.keys = Object.keys(initialValues)
		this.values = initialValues || {}

		autorun(() => {
			this.keys.forEach(key => {
				const validation = this.validations[key]
				const touched = this.touched[key]
				if (!validation) {
					delete this.errors[key]
				} else if (touched) {
					this.errors[key] = validation
				}
			})
		})
	}

	formName: string
	scheme: yup.ObjectSchema<Values>
	keys: string[]

	@observable values: Values
	@observable touched = {} as Touched
	@observable errors = {} as Errors

	@computed get validations() {
		return validate(this.scheme, this.values)
	}
	@computed get isValid() {
		return isEmpty(this.validations)
	}

	@action setValue = (key: string) => (value: any) => {
		this.values[key] = value
	}

	@action touch = (key: string) => (this.touched[key] = true)
	@action touchAll = () =>
		this.keys.forEach(key => {
			this.touched[key] = true
		})

	@action updateValues = (values: Values) =>
		Object.assign(this.values, pick(this.keys)(values))

	@action handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setValue(key)(e.target.value)
	}
	@action handleCheckedChange = (key: string) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		this.setValue(key)(e.target.checked)
	}
	@action handleBlur = (key: string) => () => {
		this.touch(key)
	}

	getValue = (key: string) => this.values[key]
	getError = (key: string) => this.errors[key]
	isRequired = (name: string) => (this.scheme.fields[name] as any)._exclusive.required

	@action handleSubmit = (submit: () => void) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		e.preventDefault()
		this.touchAll()
		if (this.isValid) {
			submit()
		}
	}
}

export const useForm = (props: UseForm) =>
	useLocalStore(source => new Store(source), props)

const FormContext = React.createContext({} as ReturnType<typeof useForm>)
export const useFormContext = () => useContext(FormContext)
export const FormContextProvider = ({
	children,
	formStore,
}: {
	children: React.ReactChildren
	formStore: ReturnType<typeof useForm>
}) => <FormContext.Provider value={formStore}>{children}</FormContext.Provider>

const FieldContext = React.createContext({})
export const useFieldContext = () => useContext(FieldContext)
export const FieldContextProvider = observer(
	({
		children,
		name,
	}: {
		children: (arg0: any) => React.ReactNode | React.ReactChildren
		name: string
	}) => {
		const store = useContext(FormContext)

		const fieldContext = {
			name,
			id: `${store.formName}_${name}`,
			setValue: store.setValue(name),
			error: store.getError(name),
			value: store.getValue(name),
			onBlur: store.handleBlur(name),
			onChange: store.handleChange(name),
			onCheckedChange: store.handleCheckedChange(name),
			isRequired: store.isRequired(name),
		}

		return (
			<FieldContext.Provider value={fieldContext}>
				{typeof children === 'function' ? children(fieldContext) : children}
			</FieldContext.Provider>
		)
	}
)
