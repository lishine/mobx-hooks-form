## React form using MobX, hooks and context

### Features

- any path form.a.b[1].input
- array
- useForm
- useField
- no extra rerenders
- FormContext
- FieldContext
- joi validation
- is field required info
- typescript
- explicit props - onChange, onBlur, value
- debounce
- submit
- reset
- state spy
- array - defaults/copy-last when adding new record
- array example - disabled row when empty
- submitting -> form disabled
- submitting state
- debug, debugMobx
- form error state
- form autofocus - seems to just work

### TODO

- reimplement with observe()
- consider removing the debounce feature
- getValue = computedFn: computedFn unnecesery
- fix - set path of value which is not in defaultValues
- values types as the schema
- see package size in imports
- example fieldContext currently not working
- tests
- CI
- documentation
- example in typescript
- array id
- accessability - auto focus field
- submit button - on hover show required list
- disabled fields logic
- hidden fields logic
- connect the example with yarn link
- optimize package size (tslib)

### Develop

- package built with tsdx
- to publish use np
- node 12
