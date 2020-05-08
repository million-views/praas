import React from 'react';
import { IonRadioGroup, IonRadio, IonLabel } from '@ionic/react';
import { Controller } from 'react-hook-form';

type Option = {
  value: string;
  label: string;
};
type Props = {
  name: string;
  value: string;
  options: Array<Option>;
  className?: string;
  labelClassName?: string;
};
const RadioGroup = ({
  name,
  value,
  options = [],
  className = '',
  labelClassName = '',
}: Props) => {
  return (
    <Controller
      as={
        <IonRadioGroup className={className}>
          {options.map((o: Option) => {
            return (
              <>
                <IonRadio value={o.value}></IonRadio>
                <IonLabel className={labelClassName}>{o.label}</IonLabel>
              </>
            );
          })}
        </IonRadioGroup>
      }
      name={name}
      defaultValue={value}
      onChangeName="onIonChange"
      onChange={([selected]) => {
        return selected.detail.value;
      }}
    ></Controller>
  );
};

export default RadioGroup;
