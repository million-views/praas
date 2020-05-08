import React from 'react';
import ConduitForm from '../Form';

type Props = {
  conduit: any;
  onUpdate: (conduit: any) => void;
};

const EditConduit: React.FC<Props> = ({ conduit, onUpdate }) => {
  return conduit?.id ? (
    <ConduitForm onSave={onUpdate} conduit={conduit} />
  ) : null;
};

export default EditConduit;
