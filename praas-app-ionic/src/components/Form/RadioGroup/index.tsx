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
  className?: string;
};

type GroupProp = {
  options: Array<OptionType>;
  className?: string;
  labelClassName?: string;
};

const Radio = ({ value, label, className }: RadioProp) => {
  return (
    <IonItem lines="none">
      <IonRadio value={value}></IonRadio>
      <IonLabel className={className}>{label}</IonLabel>
    </IonItem>
  );
};

const Group = ({
  options,
  className,
  labelClassName,
  ...restProps
}: GroupProp) => {
  return (
    <IonRadioGroup className={className} {...restProps}>
      <IonRow>
        {options.map((option: OptionType) => {
          return (
            <IonCol key={option.value}>
              <Radio
                value={option.value}
                label={option.label}
                className={`ion-padding-start ${labelClassName}`}
              />
            </IonCol>
          );
        })}
      </IonRow>
    </IonRadioGroup>
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
      as={Group}
      name={name}
      labelClassName={labelClassName}
      className={className}
      options={options}
      defaultValue={value}
      onChangeName="onIonChange"
      onChange={([selected]) => {
        return selected.detail.value;
      }}
    />
  );
};

export default RadioGroup;
