import React from 'react';
import { IonRow, IonCol, IonLabel, IonGrid, IonButton } from '@ionic/react';
import { FieldError } from 'react-hook-form';
import Input from '../../../../components/Form/Input';
import RadioGroup from '../../../../components/Form/RadioGroup';
import FormFieldWithError from '../../../../components/FormFieldWithError';
import { useFormContext } from 'react-hook-form';

type Props = {
  index: number;
  item: any;
  prefix: string;
  onDelete: (idx: number) => void;
};
const AllowListItem = ({ index, item, prefix, onDelete }: Props) => {
  const { errors } = useFormContext();

  return (
    <IonGrid className="ip-allowlist">
      <IonRow>
        <FormFieldWithError error={errors.allowlist?.[index]?.ip}>
          <IonLabel position="floating">IP Address</IonLabel>
          <Input name={`${prefix}.ip`} value={item.ip} />
        </FormFieldWithError>

        <FormFieldWithError error={errors.allowlist?.[index]?.comment}>
          <IonLabel position="floating">Comment</IonLabel>
          <Input name={`${prefix}.comment`} value={item.comment} />
        </FormFieldWithError>
        <IonButton type="button" onClick={() => onDelete(index)}>
          X
        </IonButton>
      </IonRow>
      <IonRow className="ip-allowlist-status">
        <RadioGroup
          labelClassName="ip-allowlist-status__label"
          name={`${prefix}.status`}
          value={item.status}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </IonRow>
    </IonGrid>
  );
};

export default AllowListItem;
