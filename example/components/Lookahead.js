/** @jsx jsx */
import { jsx } from 'theme-ui'
import { useState, useEffect } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import { InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import cs from 'classnames'

export const Lookahead = ({ setValue, value, error, onBlur, placeholder, id }) => {
    const [key, setKey] = useState(0)

    // REMOUNT when value changed => causes AsyncTypeahead to accept defaultSelected
    useEffect(() => {
        setKey(_key => _key + 1)
    }, [value])

    const name = value?.name

    return (
        <InputGroup
            sx={{
                'input.form-control': { borderRadius: 0 },
                '.input-group-prepend': {
                    borderTopColor: '#cccccc',
                    borderBottomColor: '#cccccc',
                    borderBottomLeftRadius: '4px',
                    borderTopLeftRadius: '4px',
                    '& > span': {
                        borderLeft: '0px',
                        bg: '#cccccc',
                    },
                },
                '.input-group-append ': {
                    borderBottomRightRadius: '4px',
                    borderTopRightRadius: '4px',
                    '& > span': {
                        borderLeft: '0px',
                        bg: '#cccccc',
                    },
                },
            }}
        >
            <InputGroupAddon sx={{ bg: '#cccccc' }} addonType="prepend">
                <InputGroupText>
                    <i className="fa fa-filter" />
                </InputGroupText>
            </InputGroupAddon>
            <AsyncTypeahead
                id={id}
                key={key}
                onBlur={onBlur}
                isInvalid={!!error}
                options={[]}
                disabled={!!value}
                isLoading={false}
                minLength={0}
                multiple={false}
                defaultSelected={(name && [name]) || undefined} // hack to display the placeholder
                placeholder={placeholder}
                onSearch={() => undefined}
            />
            <InputGroupAddon sx={{ bg: '#cccccc' }} addonType="append">
                <InputGroupText onClick={() => setValue()} sx={{ cursor: 'pointer' }}>
                    <i
                        sx={{ cursor: 'pointer', color: 'd9534f' }}
                        className={cs('fa fa-times filterBtnFilterIcon')}
                    />
                </InputGroupText>
            </InputGroupAddon>
        </InputGroup>
    )
}
