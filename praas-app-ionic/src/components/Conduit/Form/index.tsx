import React from 'react';
import { IonGrid, IonRow, IonCol, IonLabel, IonButton } from '@ionic/react';
import { useHistory } from 'react-router';
import { useForm, FormContext } from 'react-hook-form';
import Input from '../../../components/Form/Input';
import Select from '../../../components/Form/Select';
import FormFieldWithError from '../../../components/FormFieldWithError';
import IPAllowList from './IPAllowList';
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
          <IonRow>
            <IonCol>
              <FormFieldWithError error={errors.suriApiKey}>
                <IonLabel position="floating">API Key</IonLabel>
                <Input name="suriApiKey" value={conduit?.suriApiKey} />
              </FormFieldWithError>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
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
          <IonRow>
            <IonCol>
              <FormFieldWithError error={errors.suri}>
                <IonLabel position="floating">Service endpoint uri</IonLabel>
                <Input name="suri" value={conduit?.suri} />
              </FormFieldWithError>
            </IonCol>
          </IonRow>

          <IPAllowList allowlist={conduit?.allowlist} />

          <RequestMethods defaultChecked={conduit?.racm} />
          <IonRow>
            <IonCol>
              <FormFieldWithError error={errors.description}>
                <IonLabel position="floating">
                  Description of the endpoint
                </IonLabel>
                <Input name="description" value={conduit?.description} />
              </FormFieldWithError>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
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
