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
  name: string;
  value: string;
  label: string;
  className?: string;
};

type GroupProp = {
  name: string;
  options: Array<OptionType>;
  className?: string;
  labelClassName?: string;
};

const Radio = ({ name, value, label, className }: RadioProp) => {
  return (
    <IonItem
      lines="none"
      className="ion-item--no-padding ion-item--no-background"
    >
      <IonRadio name={name} value={value}></IonRadio>
      <IonLabel className={className}>{label}</IonLabel>
    </IonItem>
  );
};

const Group = ({
  name,
  options,
  className,
  labelClassName,
  ...restProps
}: GroupProp) => {
  return (
    <IonRadioGroup name={`group_${name}`} className={className} {...restProps}>
      <IonRow>
        {options.map((option: OptionType) => {
          return (
            <IonCol key={option.value}>
              <Radio
                name={name}
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
