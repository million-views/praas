import React from 'react';
import {
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonItem,
  IonCol,
  IonRow,
} from '@ionic/react';
import { Controller } from 'react-hook-form';

type OptionType = {
  value: string;
  label: string;
};
type Props = {
  name: string;
  value: string;
  options: Array<OptionType>;
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
    <IonItem lines="none">
      <IonRadio value={value}></IonRadio>
      <IonLabel className={className}>{label}</IonLabel>
    </IonItem>
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
          <IonRow>
            {options.map((option: OptionType) => {
              return (
                <IonCol>
                  <Radio
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    className={labelClassName}
                  />
                </IonCol>
              );
            })}
          </IonRow>
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
