import React from 'react';
import { IonRow, IonCol, IonLabel, IonGrid } from '@ionic/react';
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
    <IonGrid className="ip-whitelist">
      <IonRow>
        <FormFieldWithError error={errors[`${prefix}.address`]}>
          <IonLabel position="floating">IP Address</IonLabel>
          <Input name={`${prefix}.address`} value={item.address} />
        </FormFieldWithError>
        <FormFieldWithError error={errors[`${prefix}.comment`]}>
          <IonLabel position="floating">Comment</IonLabel>
          <Input name={`${prefix}.comment`} value={item.comment} />
        </FormFieldWithError>
      </IonRow>
      <IonRow className="ip-whitelist-status">
        <RadioGroup
          labelClassName="ip-whitelist-status__label"
          name={`${prefix}.state`}
          value={item.state}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
        />
      </IonRow>
    </IonGrid>
  );
};

export default WhiteListItem;
