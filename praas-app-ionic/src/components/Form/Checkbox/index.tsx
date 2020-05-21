import React from 'react';
import { IonCheckbox, IonLabel } from '@ionic/react';
import { Controller, useFormContext } from 'react-hook-form';

type CheckboxProps = {
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange?: (data: any) => void;
};

type Option = {
  value: string;
  label: string;
};
interface CheckboxGroupProps {
  name: string;
  options: Array<Option>;
  defaultChecked: Array<string>;
}
export const CheckBox = ({
  name,
  value,
  label,
  checked,
  onChange,
}: CheckboxProps) => {
  return (
    <>
      <Controller
        as={IonCheckbox}
        name={name}
        value={value}
        defaultValue={checked}
        onChangeName="onIonChange"
        onChange={([selected]) => {
          if (typeof onChange === 'function') {
            return onChange(selected.detail);
          } else {
            return selected.detail.value;
          }
        }}
      ></Controller>
      <IonLabel className="checkbox__label">{label}</IonLabel>
    </>
  );
};

export const CheckBoxGroup = ({
  name,
  options = [],
  defaultChecked,
}: CheckboxGroupProps) => {
  const { getValues } = useFormContext();
  const selected = getValues()[name] || defaultChecked || [];
  const onChange = (data: any) => {
    const updatedList = [...selected];
    if (data.checked) {
      updatedList.push(data.value);
    } else {
      updatedList.filter((d) => d !== data.value);
    }
    return updatedList;
  };
  return (
    <>
      {options.map((o) => {
        const checked = selected.includes(o.value);
        return (
          <CheckBox
            name={name}
            checked={checked}
            value={o.value}
            label={o.label}
            onChange={onChange}
          />
        );
      })}
    </>
  );
};
