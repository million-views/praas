import React from 'react';
import { IonItem, IonText, IonCol } from '@ionic/react';
import { FieldError } from 'react-hook-form';

type Props = {
  children: React.ReactNode;
  error: FieldError | undefined;
};

const FormFieldWithError = ({ children, error }: Props) => (
  <IonCol>
    <IonItem>{children}</IonItem>
    {error && <IonText color="danger">{error.message}</IonText>}
  </IonCol>
);

export default FormFieldWithError;
