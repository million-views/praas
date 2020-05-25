import React from 'react';
import { IonRow, IonCol, IonLabel } from '@ionic/react';
import { useFormContext } from 'react-hook-form';
import Input from '../../../../components/Form/Input';
import RadioGroup from '../../../../components/Form/RadioGroup';
import FormFieldWithError from '../../../../components/FormFieldWithError';

type Props = {
  item: any;
  prefix: string;
  onDelete: (idx: number) => void;
};
const WhiteListItem = ({ item, prefix, onDelete }: Props) => {
  const { errors } = useFormContext();

  return (
    <>
      <IonRow className="ion-justify-content-center ion-align-items-center ip-whitelist">
        <IonCol
          sizeXs="6"
          sizeSm="6"
          sizeMd="2"
          sizeLg="2"
          className="u-text-align-center"
        >
          <FormFieldWithError error={errors[`${prefix}.address`]}>
            <IonLabel position="floating">IP Address</IonLabel>
            <Input name={`${prefix}.address`} value={item.address} />
          </FormFieldWithError>
        </IonCol>
        <IonCol
          sizeXs="6"
          sizeSm="6"
          sizeMd="2"
          sizeLg="2"
          className="u-text-align-center"
        >
          <FormFieldWithError error={errors[`${prefix}.comment`]}>
            <IonLabel position="floating">Comment</IonLabel>
            <Input name={`${prefix}.comment`} value={item.comment} />
          </FormFieldWithError>
        </IonCol>
        <IonCol sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="2">
          <RadioGroup
            className="ip-whitelist-status ion-align-items-center"
            labelClassName="ip-whitelist-status__label"
            name={`${prefix}.state`}
            value={item.state}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </IonCol>
      </IonRow>
    </>
  );
};

export default WhiteListItem;
