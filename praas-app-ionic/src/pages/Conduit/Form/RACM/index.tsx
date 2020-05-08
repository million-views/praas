import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { CheckBoxGroup } from '../../../../components/Form/Checkbox';

import './style.scss';

const categories = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
];

type Props = {
  defaultChecked: Array<string>;
};

const RACM: React.FC<Props> = ({ defaultChecked }) => {
  return (
    <IonRow className="racm ion-justify-content-center">
      <IonCol
        className="racm__checkbox ion-align-items-center"
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
  );
};

export default RACM;
