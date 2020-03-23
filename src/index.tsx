import React, { useContext } from 'react'
import { computed, action, observable, toJS, reaction, autorun } from 'mobx'
import { computedFn } from 'mobx-utils'
import { useLocalStore, observer } from 'mobx-react-lite'
import { isEmpty, get, set } from 'lodash'
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
	[index: string]: any
}
interface Errors {
	[index: string]: string
}
interface Touched {
	[index: string]: boolean
}
interface UseForm {
	schema: yup.ObjectSchema<Values>
	defaultValues: Values
	formName: string
}

class Store {
	constructor(props: UseForm) {
		const { schema, defaultValues, formName = '' } = props
		this.defaultValues = defaultValues || {}
		this.schema = schema
		this.formName = formName
		this.values = defaultValues || {}
	}

	defaultValues: Values
	formName: string
	schema: yup.ObjectSchema<Values>

	@observable isTouchedAll = false
	@observable values: Values
	@observable touched = {} as Touched

	@computed get validations() {
		return validate(this.schema, this.values)
	}
	@computed get isValid() {
		return isEmpty(this.validations)
	}

	@action reset = () => {
		this.values = this.defaultValues
		this.touched = {}
		this.isTouchedAll = false
	}

	@action add = (path: string) => (value?: any) => {
		let ar = this.getValue(path)
		if (!Array.isArray(ar)) {
			this.setValue(path)([])
			ar = this.getValue(path)
		}
		if (value === undefined) {
			const defaultAr = get(this.defaultValues, path)
			if (Array.isArray(defaultAr)) {
				value = defaultAr.length ? defaultAr[defaultAr.length - 1] : ''
			} else if (defaultAr !== undefined) {
				value = defaultAr
			} else {
				value = ar.length ? ar[ar.length - 1] : ''
			}
		}
		ar.push(value)
	}
	@action remove = (path: string) => (index: number) => {
		const ar = this.getValue(path)
		if (!Array.isArray(ar) || index >= ar.length) {
			console.error('trying to remove item from non array or at wrong index')
		} else {
			ar.splice(index, 1)
		}
	}
	@action setValue = (path: string) => (value: any) => {
		set(this.values, path, value)
	}
	@action setValues = (values: Values) => {
		this.values = values
	}

	@action touch = (key: string) => {
		console.log('touching key', key)
		this.touched[key] = true
	}
	@action touchAll = () => {
		this.isTouchedAll = true
	}

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

	isRequired = (path: string) => {
		try {
			const { tests } = yup
				.reach(this.schema, path, this.values, this.values)
				.describe()
			return !!tests?.find((test: any) => test.name === 'required') ?? false
		} catch (error) {
			return false
		}
	}

	@computed get errors() {
		return this.isTouchedAll
			? this.validations
			: Object.fromEntries(
					Object.entries(this.validations).filter(([key]) => this.touched[key])
			  )
	}
	getError = computedFn((key: string) => this.errors[key])

	getValue = computedFn((path: string) => get(this.values, path) ?? '')
	getValueLength = computedFn((path: string) => this.getValue(path)?.length ?? 0)
	getId = (path: string) => `${this.formName}_${path}`
	getField = (path: string) => {
		const store = this
		return {
			path,
			get value() {
				return store.getValue(path)
			},
			get error() {
				return store.getError(path)
			},
			id: store.getId(path),
			setValue: store.setValue(path),
			onBlur: store.handleBlur(path),
			onChange: store.handleChange(path),
			onCheckedChange: store.handleCheckedChange(path),
			isRequired: store.isRequired(path),
			add: store.add(path),
			remove: store.remove(path),
		}
	}
	getFieldArray = (path: string) => {
		const store = this
		return {
			path,
			get error() {
				return store.getError(path)
			},
			get indexes() {
				return Array.from(Array(store.getValueLength(path)).keys())
			},
			id: store.getId(path),
			isRequired: store.isRequired(path),
			add: store.add(path),
			remove: store.remove(path),
		}
	}

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

export const useField = (path: string) => useContext(FormContext).getField(path)
export const useFieldArray = (path: string) => useContext(FormContext).getFieldArray(path)

const FieldContext = React.createContext({})
export const useFieldContext = () => useContext(FieldContext)
export const FieldContextProvider = observer(
	({
		children,
		path,
	}: {
		children: (arg0: any) => React.ReactNode | React.ReactChildren
		path: string
	}) => {
		const field = useContext(FormContext).getField(path)

		return (
			<FieldContext.Provider value={field}>
				{typeof children === 'function' ? children(field) : children}
			</FieldContext.Provider>
		)
	}
)
