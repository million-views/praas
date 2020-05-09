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

type RadioProp = {
  value: string;
  label: string;
  className: string;
};

const Radio = ({ value, label, className }: RadioProp) => {
  return (
    <>
      <IonRadio value={value}></IonRadio>
      <IonLabel className={className}>{label}</IonLabel>
    </>
  );
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
              <Radio
                key={o.value}
                value={o.value}
                label={o.label}
                className={labelClassName}
              />
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
