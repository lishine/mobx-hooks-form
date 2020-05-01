import React, { useContext } from 'react'
import { observe, autorun, computed, action, observable, spy, toJS } from 'mobx'
import { computedFn } from 'mobx-utils'
import { useLocalStore, observer } from 'mobx-react-lite'
import { isEmpty, debounce } from 'lodash'
import * as yup from 'yup'

const isObject = (obj: { index: string | number }) => typeof obj === 'object' && obj !== null

const pathToArr = (path: string) => {
  const output = [] as string[]
  path.split('.').forEach((item) => {
    item.split(/\[([^}]+)\]/g).forEach((key) => {
      if (key.length > 0) {
        output.push(key)
      }
    })
  })
  return output
}

const get = (path: string) => (obj: Values) => {
  const ar = pathToArr(path)
  if (ar[5]) {
    throw Error('mobx form path is too deep')
  } else if (ar[4]) {
    return obj[ar[0]]?.[ar[1]]?.[ar[2]]?.[ar[3]]?.[ar[4]]
  } else if (ar[3]) {
    return obj[ar[0]]?.[ar[1]]?.[ar[2]]?.[ar[3]]
  } else if (ar[2]) {
    return obj[ar[0]]?.[ar[1]]?.[ar[2]]
  } else if (ar[1]) {
    return obj[ar[0]]?.[ar[1]]
  } else {
    return obj[ar[0]]
  }
}

const set = (path: string) => (value: any) => (obj: Values) => {
  const ar = pathToArr(path)
  if (ar[5]) {
    throw Error('mobx form path is too deep')
  } else if (ar[4]) {
    const base = obj[ar[0]]?.[ar[1]]?.[ar[2]]?.[ar[3]]
    if (isObject(base)) {
      base[ar[4]] = value
    }
  } else if (ar[3]) {
    const base = obj[ar[0]]?.[ar[1]]?.[ar[2]]
    if (isObject(base)) {
      base[ar[3]] = value
    }
  } else if (ar[2]) {
    const base = obj[ar[0]]?.[ar[1]]
    if (isObject(base)) {
      base[ar[2]] = value
    }
  } else if (ar[1]) {
    const base = obj[ar[0]]
    if (isObject(base)) {
      base[ar[1]] = value
    }
  } else {
    obj[ar[0]] = value
  }
}

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
  defaultValues?: Values
  formName?: string
  debug?: boolean
  debugMobx?: boolean
  DEBOUNCE_MS?: number
}

class Store {
  constructor(props: UseForm) {
    const { schema, defaultValues, formName = '', debug = false, debugMobx = false, DEBOUNCE_MS = 0 } = props
    this.defaultValues = defaultValues || {}
    this.schema = schema
    this.debug = debug
    this.formName = formName
    this.DEBOUNCE_MS = DEBOUNCE_MS
    this.setValues(defaultValues || {})

    const resetError = () => {
      this.error = undefined
    }

    observe(this.values, () => resetError())

    if (debug) {
      autorun(() => {
        console.log('values', toJS(this.values))
        console.log('validations', toJS(this.validations))
        console.log('error', toJS(this.error))
      })
      if (debugMobx) {
        spy((event) => {
          if (event.type === 'action') {
            console.log(`%c${event.name} %c[ ${event.arguments} ]`, 'color: #bad', 'color: #bada55')
          } else {
            if (event.type || event.name) {
              console.log(`%c ${event.type} | ${event.name}`, 'color: #f9d299')
            }
          }
        })
      }
    }
  }

  debug = false
  defaultValues: Values
  formName: string
  DEBOUNCE_MS = 0
  schema: yup.ObjectSchema<Values>

  @observable isTouchedAll = false
  @observable touched = {} as Touched
  @observable submitting = false
  @observable error: any = undefined
  @action setError = (error: any) => {
    this.error = error
  }
  @action setSubmitting = (submitting: boolean) => {
    this.submitting = submitting
  }

  @observable values = {} as Values
  @observable debouncedValues = {} as Values
  getValue = computedFn(function getValue(this: Store, path: string) {
    return get(path)(this.values) ?? ''
  })
  getDebouncedValue = computedFn(function getDebouncedValue(this: Store, path: string) {
    return get(path)(this.debouncedValues) ?? ''
  })
  getValueLength = computedFn(function getValueLength(this: Store, path: string) {
    return this.getValue(path)?.length ?? 0
  })
  @action setDebouncedValue = debounce((path: string, value: any) => {
    set(path)(value)(this.debouncedValues)
  }, this.DEBOUNCE_MS)
  @action pushDebouncedValue = debounce((path: string, value: any) => {
    get(path)(this.debouncedValues).push(value)
  }, this.DEBOUNCE_MS)
  @action removeDebouncedValue = debounce((path: string, index: number) => {
    get(path)(this.debouncedValues).splice(index, 1)
  }, this.DEBOUNCE_MS)
  @action pushValue = (path: string, value: any) => {
    get(path)(this.values).push(value)
    this.pushDebouncedValue(path, value)
  }
  @action removeValue = (path: string, index: number) => {
    get(path)(this.values).splice(index, 1)
    this.removeDebouncedValue(path, index)
  }
  @action setValue = (path: string) => (value: any) => {
    set(path)(value)(this.values)
    this.setDebouncedValue(path, value)
  }
  @action setValues = (values: Values) => {
    this.values = values
    this.debouncedValues = values
  }

  @computed get validations() {
    return validate(this.schema, this.debouncedValues)
  }
  isRequired = computedFn(function isRequired(this: Store, path: string) {
    try {
      const { tests } = yup.reach(this.schema, path, this.debouncedValues, this.debouncedValues).describe()
      return !!tests?.find((test: any) => test.name === 'required') ?? false
    } catch (error) {
      return false
    }
  })
  @computed get isValid() {
    return isEmpty(this.validations)
  }
  @action reset = () => {
    this.setValues(this.defaultValues)
    this.touched = {}
    this.isTouchedAll = false
  }
  handleSubmit = (submit: (values: Values) => any) =>
    action('handleSubmit', async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      this.touchAll()
      if (this.isValid) {
        this.setSubmitting(true)
        await submit(this.values)?.catch((e: any) => this.setError(e))
        this.setSubmitting(false)
      }
    })

  @action touch = (path: string) => {
    this.touched[path] = true
  }
  @action touchAll = () => {
    this.isTouchedAll = true
  }

  @computed get errors() {
    return this.isTouchedAll
      ? this.validations
      : Object.fromEntries(Object.entries(this.validations).filter(([key]) => this.touched[key]))
  }
  getError = computedFn(function getError(this: Store, key: string) {
    return this.errors[key]
  })
  getId = (path: string) => `${this.formName}_${path}`
  getField = computedFn(function getField(this: Store, path: string) {
    const store = this
    return {
      path,
      submitting: store.submitting,
      get value() {
        return store.getValue(path)
      },
      get error() {
        return store.getError(path)
      },
      id: store.getId(path),
      setValue: store.setValue(path),
      onBlur: action('onBlur', () => {
        store.touch(path)
      }),
      onChange: action('onChange', (e: React.ChangeEvent<HTMLInputElement>) => {
        store.setValue(path)(e.target.value)
      }),
      onCheckedChange: action('onCheckedChange', (e: React.ChangeEvent<HTMLInputElement>) => {
        store.setValue(path)(e.target.checked)
      }),
      isRequired: store.isRequired(path),
    }
  })
  getFieldArray = computedFn(function getFieldArray(this: Store, path: string) {
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
      add: action('add', (value?: any) => {
        const ar = store.getValue(path)
        if (!Array.isArray(ar)) {
          store.setValue(path)([])
        }
        if (value === undefined) {
          const defaultAr = get(path)(store.defaultValues)
          if (Array.isArray(defaultAr)) {
            value = defaultAr.length ? defaultAr[defaultAr.length - 1] : ''
          } else if (defaultAr !== undefined) {
            value = defaultAr
          } else {
            value = ar.length ? ar[ar.length - 1] : ''
          }
        }
        store.pushValue(path, value)
      }),
      remove: action('remove', (index: number) => {
        const ar = store.getValue(path)
        if (!Array.isArray(ar) || index >= ar.length) {
          console.error('trying to remove item from non array or at wrong index')
        } else {
          store.removeValue(path, index)
          if (ar.length === 0) {
            const d = get(path)(store.defaultValues)
            if (!Array.isArray(d)) {
              store.setValue(path)(d)
            }
          }
        }
      }),
    }
  })
}

export const useForm = (props: UseForm) => useLocalStore((source) => new Store(source), props)

const FormContext = React.createContext({} as ReturnType<typeof useForm>, () => 0)
export const useFormContext = () => useContext(FormContext)
export const FormContextProvider = ({
  children,
  formStore,
}: {
  children: React.ReactNode
  formStore: ReturnType<typeof useForm>
}) => <FormContext.Provider value={formStore}>{children}</FormContext.Provider>

export const useField = (path: string) => useContext(FormContext).getField(path)
export const useFieldArray = (path: string) => useContext(FormContext).getFieldArray(path)

const FieldContext = React.createContext({})
export const useFieldContext = () => useContext(FieldContext)
export const FieldContextProvider = observer(
  ({ children, path }: { children: (arg0: any) => React.ReactNode | React.ReactChildren; path: string }) => {
    const field = useContext(FormContext).getField(path)

    return (
      <FieldContext.Provider value={field}>
        {typeof children === 'function' ? children(field) : children}
      </FieldContext.Provider>
    )
  }
)
