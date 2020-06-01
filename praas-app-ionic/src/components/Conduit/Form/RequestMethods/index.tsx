import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { CheckBoxGroup } from '../../../../components/Form/Checkbox';

import './style.scss';
import { useFormContext } from 'react-hook-form';

const categories = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
];

type Props = {
  defaultChecked: Array<string>;
};

const RequestMethods: React.FC<Props> = ({ defaultChecked }) => {
  const { errors } = useFormContext();

  return (
    <>
      <IonRow className="request-methods ion-justify-content-center">
        <IonCol
          className="request-methods__checkbox ion-align-items-center"
          sizeXs="12"
          sizeSm="12"
          sizeMd="8"
          sizeLg="6"
        >
          <CheckBoxGroup
            name="racm"
            defaultChecked={defaultChecked}
            options={categories}
          />
        </IonCol>
      </IonRow>
      <IonRow className="request-methods ion-justify-content-center">
        <IonCol
          className="ion-align-items-center"
          sizeXs="12"
          sizeSm="12"
          sizeMd="8"
          sizeLg="6"
        >
          <div className="error">{errors['racm']?.message}</div>
        </IonCol>
      </IonRow>
    </>
  );
};

export default RequestMethods;
