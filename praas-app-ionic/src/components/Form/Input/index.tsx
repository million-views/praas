import React from 'react';
import { IonInput, IonText } from '@ionic/react';
import { Controller, useFormContext } from 'react-hook-form';
import './styles.scss';

type Props = {
  type?: 'text' | 'email' | 'password';
  name: string;
  title: string;
  value?: string;
  prefix?: string;
};
const Input: React.FC<Props> = ({
  type = 'text',
  name,
  title,
  value,
  prefix,
}) => {
  const { control } = useFormContext();
  return (
    <div className="input-wrapper">
      {prefix && <IonText>{prefix}</IonText>}
      <Controller
        as={IonInput}
        title={title}
        type={type}
        name={name}
        control={control}
        defaultValue={value}
        onChangeName="onIonChange"
        onChange={([event]) => {
          return event.detail.value;
        }}
      />
    </div>
  );
};

export default Input;
