import React from 'react';
import { IonRow, IonCol, IonButton } from '@ionic/react';
import AllowListItem from './AllowlistItem';
import { useFormContext, useFieldArray } from 'react-hook-form';

import './style.scss';

type AllowList = {
  key: number;
  ip: string;
  comment: string;
  status: string;
};
type Props = {
  allowlist: Array<AllowList>;
};

const IPAllowList: React.FC<Props> = ({ allowlist = [] }) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'allowlist',
  });

  const onAdd = () => {
    append({ ip: '', comment: '', status: 'inactive' });
  };
  const onDelete = (index: number) => {
    remove(index);
  };

  return (
    <>
      {fields.map((fieldGroup, index) => {
        const namePrefix = `allowlist[${index}]`;
        return (
          <AllowListItem
            key={namePrefix}
            item={fieldGroup}
            index={index}
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
