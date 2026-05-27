'use client'

import * as Popover from '@radix-ui/react-popover'

type FieldTooltipProps = {
  text: string
}

export function FieldTooltip({ text }: FieldTooltipProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="enquiry-field__tooltip-trigger"
          aria-label="More information"
        >
          ⓘ
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="enquiry-field__tooltip-content"
          sideOffset={4}
          role="tooltip"
        >
          {text}
          <Popover.Arrow className="enquiry-field__tooltip-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
