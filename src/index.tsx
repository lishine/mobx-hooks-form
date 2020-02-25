import React, { useEffect, useContext } from 'react'
import { autorun, action } from 'mobx'
import { useLocalStore, observer } from 'mobx-react-lite'
import { isEmpty } from 'lodash'
import { has, pick } from 'lodash/fp'
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

export function validate(schema: yup.ObjectSchema<Values>, values: {}) {
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

export function useForm({
    scheme,
    initialValues,
    name = '',
}: {
    scheme: yup.ObjectSchema<Values>
    initialValues: Values
    name: string
}) {
    console.log('name', name)
    const keys = Object.keys(initialValues)

    const state = useLocalStore(() => ({
        values: initialValues || ({} as Values),
        touched: {} as Touched,
        errors: {} as Errors,
        setValue: action('setValue', (key: string) => (value: any) => {
            state.values[key] = value
        }),
        touch: action('touch', (key: string) => {
            state.touched[key] = true
        }),
        touchAll: action('touchAll', () => {
            keys.forEach(key => {
                state.touched[key] = true
            })
        }),

        updateValues: action('updateValues', (values: Values) => {
            Object.assign(state.values, pick(keys)(values))
        }),

        get validations() {
            return validate(scheme, state.values)
        },
        get isValid() {
            return isEmpty(state.validations)
        },
    }))

    const _validationsToErrors = () => {
        console.log('_validationsToErrors')
        Object.keys(state.errors).forEach(key => {
            if (!has(key)(state.validations)) {
                delete state.errors[key]
            }
        })
        Object.entries(state.validations).forEach(([key, value]) => {
            if (state.touched[key]) {
                state.errors[key] = value
            }
        })
    }

    useEffect(
        () =>
            autorun(() => {
                _validationsToErrors()
            }),
        []
    )

    const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('e.target.value', e.target.value)
        console.log('key', key)
        state.setValue(key)(e.target.value)
    }
    const handleCheckedChange = (key: string) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => state.setValue(key)(e.target.checked)
    const handleBlur = (key: string) => () => state.touch(key)
    const getValue = (key: string) => state.values[key]
    const getError = (key: string) => state.errors[key]

    return {
        getValue,
        getError,
        getValues: () => state.values,
        updateValues: state.updateValues,
        setValue: state.setValue,
        isValid: () => state.isValid,
        handleChange,
        handleCheckedChange,
        handleBlur,
        formName: name,
        getFieldProps: (key: string) => ({
            value: getValue(key),
            onChange: handleChange(key),
            onBlur: handleBlur(key),
            name: key,
        }),
        handleSubmit: (submit: () => void) => (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            e.preventDefault()
            state.touchAll()
            _validationsToErrors()
            if (state.isValid) {
                submit()
            }
        },
        isRequired: (name: string) => (scheme.fields[name] as any)._exclusive.required,
    }
}

const FormContext = React.createContext({} as ReturnType<typeof useForm>)
const FieldContext = React.createContext({})
export const useFormContext = () => useContext(FormContext)
export const useFieldContext = () => useContext(FieldContext)

export const FormContextProvider = observer(
    ({
        children,
        formStore,
    }: {
        children: React.ReactChildren
        formStore: ReturnType<typeof useForm>
    }) => <FormContext.Provider value={formStore}>{children}</FormContext.Provider>
)

export const FieldContextProvider = observer(
    ({
        children,
        name,
    }: {
        children: (arg0: any) => React.ReactNode | React.ReactChildren
        name: string
    }) => {
        const {
            getValue,
            setValue,
            getError,
            handleBlur,
            handleChange,
            handleCheckedChange,
            isRequired,
            formName,
        } = useContext(FormContext)

        const fieldContext = {
            name,
            id: `${formName}_${name}`,
            setValue: setValue(name),
            error: getError(name),
            value: getValue(name),
            onBlur: handleBlur(name),
            onChange: handleChange(name),
            onCheckedChange: handleCheckedChange(name),
            isRequired: isRequired(name),
        }

        return (
            <FieldContext.Provider value={fieldContext}>
                {typeof children === 'function' ? children(fieldContext) : children}
            </FieldContext.Provider>
        )
    }
)
