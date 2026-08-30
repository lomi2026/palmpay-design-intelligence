'use client';

import { Children, isValidElement, useState, type ReactNode, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  containerClassName?: string;
};

type SelectOption = {
  disabled: boolean;
  label: ReactNode;
  value: string;
};

const EMPTY_VALUE = '__palmpay_empty_select_value__';

function collectOptions(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === 'option') {
      const props = child.props as { children?: ReactNode; disabled?: boolean; value?: string | number };
      const value = String(props.value ?? '');
      options.push({ disabled: Boolean(props.disabled), label: props.children, value: value || EMPTY_VALUE });
      return;
    }
    const props = child.props as { children?: ReactNode };
    if (props.children) options.push(...collectOptions(props.children));
  });
  return options;
}

export function NativeSelect({
  children,
  className,
  containerClassName,
  defaultValue,
  disabled,
  id,
  name,
  required,
  value: controlledValue,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: NativeSelectProps) {
  const options = collectOptions(children);
  const initialValue = String(controlledValue ?? defaultValue ?? options[0]?.value ?? EMPTY_VALUE) || EMPTY_VALUE;
  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
  const value = controlledValue === undefined ? uncontrolledValue : String(controlledValue) || EMPTY_VALUE;

  return (
    <span className={cn('relative inline-flex min-w-0', containerClassName)}>
      {name ? <input name={name} type="hidden" value={value === EMPTY_VALUE ? '' : value} /> : null}
      <Select disabled={disabled} onValueChange={setUncontrolledValue} value={value}>
        <SelectTrigger
          aria-describedby={ariaDescribedBy}
          aria-label={ariaLabel}
          aria-required={required}
          className={className}
          id={id}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" position="popper" sideOffset={4}>
          {options.map((option) => (
            <SelectItem disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </span>
  );
}
