import React, { useState } from 'react';
import { IonRow, IonCol, IonButton } from '@ionic/react';
import WhiteListItem from './WhitelistItem';
import { useFormContext } from 'react-hook-form';

import './style.scss';
import noop from '../../../../utils/noop';

type WhiteList = {
  ip: string;
  comment: string;
  status: string;
};
type Props = {
  whitelist: Array<WhiteList>;
};

const IPWhiteList: React.FC<Props> = ({ whitelist = [] }) => {
  const [whitelistState, setWhitelistState] = useState(whitelist);
  const { getValues, errors } = useFormContext();

  const onAdd = () => {
    const currentValues = getValues({ nest: true })['whitelist'] || [];
    const newState = [
      ...currentValues,
      { ip: '', comment: '', status: 'inactive' },
    ];
    setWhitelistState(newState);
  };

  return (
    <>
      {whitelistState.map((w, index) => {
        const namePrefix = `whitelist[${index}]`;
        return (
          <WhiteListItem
            error={errors.whitelist?.[index]}
            key={namePrefix}
            item={w}
            prefix={namePrefix}
            onDelete={noop}
          />
        );
      })}
      <IonRow className="ion-justify-content-center">
        <IonCol>
          <IonButton type="button" onClick={onAdd}>
            Add IP Address
          </IonButton>
        </IonCol>
      </IonRow>
    </>
  );
};

export default IPWhiteList;
