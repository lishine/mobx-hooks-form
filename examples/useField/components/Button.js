/** @jsx jsx */
import { jsx } from 'theme-ui'
import { css, cx } from 'emotion'

import { Button as ReakitButton } from 'reakit'

import './loading.scss'

const Loading = () => (
  <div className='loading-container'>
    <div className='sub-container'>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
)

export const Button = ({ className, disabled, children, isLoading, ...props }) => (
  <ReakitButton
    className={cx(
      className,
      'btn',
      'btn-primary',
      css([
        { position: 'relative', pointerEvents: 'auto !important' },
        (isLoading || disabled) && {
          opacity: '0.4 !important',
          cursor: 'no-drop !important',
        },
      ])
    )}
    disabled={disabled}
    {...props}
  >
    {isLoading && <Loading />}
    {children}
  </ReakitButton>
)
