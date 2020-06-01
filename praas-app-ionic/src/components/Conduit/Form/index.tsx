import React from 'react';
import { IonGrid, IonRow, IonCol, IonLabel, IonButton } from '@ionic/react';
import { useHistory } from 'react-router';
import { useForm, FormContext } from 'react-hook-form';
import Input from '../../../components/Form/Input';
import Select from '../../../components/Form/Select';
import FormFieldWithError from '../../../components/FormFieldWithError';
import IPWhiteList from './IPWhiteList';
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
  const onSubmit = (values: any) => {
    onSave(values);
  };

  return (
    <FormContext {...formMethods}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol
              sizeXs="12"
              sizeSm="12"
              sizeMd="8"
              sizeLg="6"
              className="text-align-center"
            >
              <FormFieldWithError error={errors.suriApiKey}>
                <IonLabel position="floating">API Key</IonLabel>
                <Input name="suriApiKey" value={conduit?.suriApiKey} />
              </FormFieldWithError>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center">
            <IonCol
              sizeXs="12"
              sizeSm="12"
              sizeMd="8"
              sizeLg="6"
              className="text-align-center"
            >
              <FormFieldWithError error={errors.suriType}>
                <IonLabel position="floating">Select Type</IonLabel>
                <Select
                  name="suriType"
                  value={conduit?.suriType}
                  options={conduitTypes}
                />
              </FormFieldWithError>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center">
            <IonCol
              sizeXs="12"
              sizeSm="12"
              sizeMd="8"
              sizeLg="6"
              className="text-align-center"
            >
              <FormFieldWithError error={errors.suri}>
                <IonLabel position="floating">Service endpoint uri</IonLabel>
                <Input name="suri" value={conduit?.suri} />
              </FormFieldWithError>
            </IonCol>
          </IonRow>

          <IPWhiteList whitelist={conduit?.whitelist} />

          <RequestMethods defaultChecked={conduit?.racm} />
          <IonRow className="ion-justify-content-center">
            <IonCol
              sizeXs="12"
              sizeSm="12"
              sizeMd="8"
              sizeLg="6"
              className="text-align-center"
            >
              <FormFieldWithError error={errors.description}>
                <IonLabel position="floating">
                  Description of the endpoint
                </IonLabel>
                <Input name="description" value={conduit?.description} />
              </FormFieldWithError>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center">
            <IonCol sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6">
              <IonButton type="submit">Submit</IonButton>
              <IonButton type="button" fill="outline" onClick={onBack}>
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
