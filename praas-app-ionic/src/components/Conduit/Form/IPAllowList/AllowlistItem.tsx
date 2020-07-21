import React from 'react';
import {
  IonRow,
  IonCol,
  IonLabel,
  IonGrid,
  IonButton,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
  IonRippleEffect,
  IonIcon,
  IonItem,
} from '@ionic/react';
import Input from '../../../../components/Form/Input';
import RadioGroup from '../../../../components/Form/RadioGroup';
import FormFieldWithError from '../../../../components/FormFieldWithError';
import { useFormContext } from 'react-hook-form';
import { closeOutline } from 'ionicons/icons';

type Props = {
  index: number;
  item: any;
  prefix: string;
  onDelete: (idx: number) => void;
};
const AllowListItem = ({ index, item, prefix, onDelete }: Props) => {
  const { errors } = useFormContext();

  return (
    <IonCard className="ion-no-margin ion-margin-bottom">
      <IonCardHeader>
        <IonButton
          fill="clear"
          color="dark"
          onClick={() => onDelete(index)}
          className="ion-float-right ip-allowlist__close-button"
        >
          <IonIcon icon={closeOutline} slot="icon-only" />
        </IonButton>
        <IonCardSubtitle>IP Details</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <IonRow className="ip-allowlist">
          <IonCol size="12" sizeMd="6">
            <FormFieldWithError error={errors.allowlist?.[index]?.ip}>
              <IonLabel position="floating">IP Address</IonLabel>
              <Input name={`${prefix}.ip`} value={item.ip} title="IP Address" />
            </FormFieldWithError>
          </IonCol>
          <IonCol size="12" sizeMd="6">
            <FormFieldWithError error={errors.allowlist?.[index]?.comment}>
              <IonLabel position="floating">Comment</IonLabel>
              <Input
                name={`${prefix}.comment`}
                value={item.comment}
                title="Comment"
              />
            </FormFieldWithError>
          </IonCol>
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
      </IonCardContent>
    </IonCard>
  );
};

export default AllowListItem;
