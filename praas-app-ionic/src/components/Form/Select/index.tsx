import React from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { Controller } from 'react-hook-form';

type Option = { value: string; label: string };
type Props = {
  name: string;
  value: string;
  options: Array<Option>;
  multiple?: boolean;
};
const Select = ({ name, value, options, multiple = false }: Props) => {
  return (
    <Controller
      as={
        <IonSelect>
          {options.map((o: Option) => (
            <IonSelectOption value={o.value}>{o.label}</IonSelectOption>
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
