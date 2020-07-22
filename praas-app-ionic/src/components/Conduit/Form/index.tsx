import React from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonButton,
  IonItem,
} from '@ionic/react';
import { useHistory } from 'react-router';
import { useForm, FormContext } from 'react-hook-form';
import Input from '../../../components/Form/Input';
import Select from '../../../components/Form/Select';
import FormFieldWithError from '../../../components/FormFieldWithError';
import RadioGroup from '../../../components/Form/RadioGroup';

import RequestMethods from './RequestMethods';
import { conduitTypes } from '../options';
import conduitSchema from './schema';
type Props = {
  conduit: any;
  onSave: (conduit: any) => void;
};

const ConduitForm: React.FC<Props> = ({ conduit, onSave }) => {
  const formMethods = useForm({
    defaultValues: conduit,
    validationSchema: conduitSchema,
  });

  const history = useHistory();

  const { handleSubmit, errors } = formMethods;

  const onBack = () => {
    history.goBack();
  };
  const parseRACM = (racm: any) => {
    const racmList: string[] = [];
    Object.keys(racm).forEach((key) => {
      if (racm[key]) {
        racmList.push(key);
      }
    });
    return racmList;
  };
  const onSubmit = (values: any) => {
    onSave({ ...values, racm: parseRACM(values.racm) });
  };
  return (
    <FormContext {...formMethods}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <IonGrid>
          <IonRow className="ion-margin-bottom ion-align-items-end">
            <IonCol size="12" sizeMd="6">
              <FormFieldWithError error={errors.suriApiKey}>
                <IonLabel position="stacked">API Key</IonLabel>
                <Input
                  name="suriApiKey"
                  value={conduit?.suriApiKey}
                  title="API Key"
                />
              </FormFieldWithError>
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <FormFieldWithError error={errors.suriType}>
                <IonLabel position="stacked">Select Type</IonLabel>
                <Select
                  name="suriType"
                  value={conduit?.suriType}
                  options={conduitTypes}
                />
              </FormFieldWithError>
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-bottom">
            <IonCol size="12" sizeMd="6">
              <FormFieldWithError error={errors.suri}>
                <IonLabel position="stacked">Service endpoint uri</IonLabel>
                <Input name="suri" value={conduit?.suri} title="SURI" />
              </FormFieldWithError>
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <FormFieldWithError error={errors.description}>
                <IonLabel position="stacked">
                  Description of the endpoint
                </IonLabel>
                <Input
                  name="description"
                  value={conduit?.description}
                  title="Description"
                />
              </FormFieldWithError>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonLabel className="ion-padding-top">
                Request Methods
                <RequestMethods defaultChecked={conduit?.racm} />
              </IonLabel>
            </IonCol>
          </IonRow>

          <IonRow className="ip-allowlist-status">
            <IonCol size="auto">
              <IonLabel>
                Conduit Status
                <RadioGroup
                  labelClassName="status__label"
                  name="status"
                  value={conduit?.status || 'inactive'}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </IonLabel>
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-top">
            <IonCol>
              <IonButton type="submit">Submit</IonButton>
              <IonButton
                type="button"
                fill="outline"
                onClick={onBack}
                className="ion-margin-start"
              >
                Back
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </form>
    </FormContext>
  );
};

export default ConduitForm;
