import { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { notSystemAttributePredicate } from 'common/utils/attributeUtils';
import { EditableAttribute } from './editableAttribute';
import styles from './attributeList.scss';

const cx = classNames.bind(styles);

const createEditHandler = (attributes, index, onChange) => (newAttribute) => {
  const newAttributes = [...attributes];
  newAttributes[index] = newAttribute;
  onChange(newAttributes);
};

const createRemoveHandler = (attributes, index, onRemove) => () => {
  const newAttributes = [...attributes];
  newAttributes.splice(index, 1);
  onRemove(newAttributes);
};

const isEditMode = (currentAttribute, editedAttribute) =>
  editedAttribute &&
  currentAttribute.key === editedAttribute.key &&
  currentAttribute.value === editedAttribute.value;

export const AttributeList = ({ attributes, editedAttribute, onChange, onEdit, onAddNew }) => (
  <Fragment>
    {attributes
      .filter(notSystemAttributePredicate)
      .map((attribute, i) => (
        <EditableAttribute
          key={`${attribute.key}_${attribute.value}`}
          attribute={attribute}
          editMode={isEditMode(attribute, editedAttribute)}
          onChange={createEditHandler(attributes, i, onChange)}
          onRemove={createRemoveHandler(attributes, i, onChange)}
          onEdit={onEdit}
        />
      ))}
    <div
      className={cx('add-new-button', { disabled: !!editedAttribute })}
      onClick={!editedAttribute ? onAddNew : undefined}
    >
      + <FormattedMessage id="AttributeList.addNew" defaultMessage="Add new" />
    </div>
  </Fragment>
);
AttributeList.propTypes = {
  attributes: PropTypes.arrayOf(PropTypes.object),
  editedAttribute: PropTypes.object,
  onChange: PropTypes.func,
  onEdit: PropTypes.func,
  onAddNew: PropTypes.func,
};
AttributeList.defaultProps = {
  attributes: [],
  editedAttribute: null,
  onChange: () => {},
  onEdit: () => {},
  onAddNew: () => {},
};