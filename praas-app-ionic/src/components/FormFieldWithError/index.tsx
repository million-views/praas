import React from 'react';
import { IonItem } from '@ionic/react';
import { FieldError } from 'react-hook-form';

type Props = {
  children: React.ReactNode;
  error: FieldError | undefined;
};

const FormFieldWithError = ({ children, error }: Props) => (
  <IonItem>
    {children}
    {error && <div className="error">{error.message}</div>}
  </IonItem>
);

export default FormFieldWithError;
