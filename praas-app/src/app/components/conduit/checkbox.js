import React from 'react';
import PropTypes from 'prop-types';

const Checkbox = (props) => {
  console.log('props: ', props);
  const { arrayHelpers, categories, values } = props;
  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          <label>
            <input
              name="racm"
              type="checkbox"
              value={category.id}
              checked={values.racm.includes(category.id)}
              onChange={e => {
                if (e.target.checked) arrayHelpers.push(category.id);
                else {
                  const idx = values.racm.indexOf(category.id);
                  arrayHelpers.remove(idx);
                }
              }}
            />{''}
            {category.name}
          </label>
        </div>
      ))}
    </div>
  );
};

Checkbox.propTypes = {
  arrayHelpers: PropTypes.object,
  categories: PropTypes.array,
  values: PropTypes.object,
};

export default Checkbox;
