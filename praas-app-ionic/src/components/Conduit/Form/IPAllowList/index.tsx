import React, { useState } from 'react';
import { IonRow, IonCol, IonButton } from '@ionic/react';
import AllowListItem from './AllowlistItem';
import { useFormContext } from 'react-hook-form';

import './style.scss';

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
    console.log('@newState', allowlistState);
    setAllowlistState(newState);
  };

  const onDelete = (index: number) => {
    /* console.log('index number on delete:', index);
    const currentValues = getValues({ nest: true })['allowlist'] || [];
    console.log('@before delete', currentValues);
    //setAllowlistState(currentValues.splice(index, 1));
    currentValues.splice(index, 1);
    console.log('@after delete', currentValues);
    const newState = [ ...currentValues ];
    //console.log('@newState in delete, before setAllowlistState', newState);
    setAllowlistState(newState); */
    const toBeDeleted = allowlistState[index];
    setAllowlistState(prev =>  [...prev.filter(item => item !== toBeDeleted)]);
  }

  return (
    <>
      {allowlistState.map((w, index) => {
        console.log('allowlist index while displaying', index);
        const namePrefix = `allowlist[${index}]`;
        return (
          <AllowListItem
            index={index}
            error={errors.allowlist?.[index]}
            key={namePrefix}
            item={w}
            prefix={namePrefix}
            onDelete={onDelete}
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
