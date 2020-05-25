import React, { useState } from 'react';
import { IonRow, IonCol, IonButton } from '@ionic/react';
import WhiteListItem from './WhitelistItem';
import { useFormContext } from 'react-hook-form';

import './style.scss';
import noop from '../../../../utils/noop';

type WhiteList = {
  address: string;
  comment: string;
  state: string;
};
type Props = {
  whitelist: Array<WhiteList>;
};

const ConduitForm: React.FC<Props> = ({ whitelist = [] }) => {
  const [whitelistState, setWhitelistState] = useState(whitelist);
  const { getValues } = useFormContext();

  const onAdd = () => {
    const currentValues = getValues({ nest: true })['whitelist'] || [];
    const newState = [
      ...currentValues,
      { address: '', comment: '', state: 'Inactive' },
    ];
    setWhitelistState(newState);
  };

  return (
    <>
      {whitelistState.map((w, index) => {
        const namePrefix = `whitelist[${index}]`;
        return (
          <WhiteListItem
            key={namePrefix}
            item={w}
            prefix={namePrefix}
            onDelete={noop}
          />
        );
      })}
      <IonRow className="ion-justify-content-center">
        <IonCol sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6">
          <IonButton type="button" onClick={onAdd}>
            Add IP Address
          </IonButton>
        </IonCol>
      </IonRow>
    </>
  );
};

export default ConduitForm;
