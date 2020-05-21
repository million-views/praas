import React from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { Controller } from 'react-hook-form';

type OptionType = { value: string; label: string };
type Props = {
  name: string;
  value: string;
  options: Array<OptionType>;
  multiple?: boolean;
};
const Select = ({ name, value, options, multiple = false }: Props) => {
  return (
    <Controller
      as={
        <IonSelect>
          {options.map((option: OptionType) => (
            <IonSelectOption key={option.value} value={option.value}>
              {option.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      }
      name={name}
      value={value}
      multiple={multiple}
      onChangeName="onIonChange"
      onChange={([event]) => event.detail.value}
    />
  );
};

export default Select;
