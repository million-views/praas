import React from 'react';
import { IonInput } from '@ionic/react';
import { Controller, useFormContext } from 'react-hook-form';

type Props = {
  type?: 'text' | 'email' | 'password';
  name: string;
  title: string;
  value?: string;
};
const Input: React.FC<Props> = ({ type = 'text', name, title, value }) => {
  const { control } = useFormContext();
  return (
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
    ></Controller>
  );
};

export default Input;
