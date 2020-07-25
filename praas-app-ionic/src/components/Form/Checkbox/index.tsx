import React from 'react';
import { IonCheckbox, IonLabel, IonItem, IonCol, IonRow } from '@ionic/react';
import { Controller, useFormContext } from 'react-hook-form';

type CheckboxProps = {
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange?: (data: any) => void;
};

type OptionType = {
  value: string;
  label: string;
};
interface CheckboxGroupProps {
  name: string;
  options: Array<OptionType>;
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
    <IonCol sizeXs="6" sizeMd="auto">
      <IonItem className="ion-no-padding ion-item--no-background" lines="none">
        <Controller
          as={IonCheckbox}
          name={name}
          value={value}
          defaultValue={checked}
          onChangeName="onIonChange"
        ></Controller>
        <IonLabel className="checkbox__label">{label}</IonLabel>
      </IonItem>
    </IonCol>
  );
};

export const CheckBoxGroup = ({
  name,
  options = [],
  defaultChecked,
}: CheckboxGroupProps) => {
  const { getValues } = useFormContext();
  const selected = getValues()[name] || defaultChecked || [];
  return (
    <IonRow>
      {options.map((option) => {
        const checked = selected.includes(option.value);
        return (
          <CheckBox
            key={option.value}
            name={`${name}[${option.value}]`}
            checked={checked}
            value={option.value}
            label={option.label}
          />
        );
      })}
    </IonRow>
  );
};
