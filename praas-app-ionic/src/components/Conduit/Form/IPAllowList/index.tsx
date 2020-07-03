import React, { useState } from 'react';
import { IonRow, IonCol, IonButton } from '@ionic/react';
import AllowListItem from './AllowlistItem';
import { useFormContext } from 'react-hook-form';

import './style.scss';
import noop from '../../../../utils/noop';

type AllowList = {
  ip: string;
  comment: string;
  status: string;
};
type Props = {
  allowlist: Array<AllowList>;
};

const IPAllowList: React.FC<Props> = ({ allowlist = [] }) => {
  const [allowlistState, setAllowlistState] = useState(allowlist);
  const { getValues, errors } = useFormContext();

  const onAdd = () => {
    const currentValues = getValues({ nest: true })['allowlist'] || [];
    const newState = [
      ...currentValues,
      { ip: '', comment: '', status: 'inactive' },
    ];
    setAllowlistState(newState);
  };

  return (
    <>
      {allowlistState.map((w, index) => {
        const namePrefix = `allowlist[${index}]`;
        return (
          <AllowListItem
            error={errors.allowlist?.[index]}
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

export default IPAllowList;
