import React from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { fileSizeConverter } from 'common/utils';
import { ProgressLoader } from './progressLoader';
import { InvalidIcon, UploadIndicator } from './iconStateIndicators';
import SheetIcon from './img/launch-icon-inline.svg';
import DeleteIcon from './img/icon-delete-inline.svg';
import styles from './launcIcon.scss';

const cx = classNames.bind(styles);

export const LaunchIcon = ({
  file,
  valid,
  uploaded,
  isLoading,
  id,
  onDelete,
  uploadingProgress,
  rejectMessage,
  uploadFailed,
  uploadFailReason,
}) => {
  const deleteHandler = (e) => {
    e.stopPropagation();

    onDelete(id);
  };
  const uploadedProps = {
    uploaded,
    uploadFailed,
    uploadFailReason,
  };

  return (
    <div className={cx('file-wrapper')}>
      <div className={cx('file')}>
        {Parser(SheetIcon)}
        <div className={cx('file-info')}>
          <p className={cx('file-size')}>{fileSizeConverter(file.size)}</p>
          <div className={cx('file-state-holder')}>
            {valid ? (
              <UploadIndicator {...uploadedProps} />
            ) : (
              <InvalidIcon rejectMessage={rejectMessage} />
            )}
          </div>
          {isLoading ? (
            <ProgressLoader progress={uploadingProgress} />
          ) : (
            <p className={cx('file-name')}>{file.name}</p>
          )}
        </div>
        {!(uploaded || isLoading) && (
          <div className={cx('file-delete')} onClick={deleteHandler}>
            {Parser(DeleteIcon)}
          </div>
        )}
      </div>
    </div>
  );
};

LaunchIcon.propTypes = {
  file: PropTypes.object,
  valid: PropTypes.bool,
  uploaded: PropTypes.bool,
  isLoading: PropTypes.bool,
  id: PropTypes.string,
  onDelete: PropTypes.func,
  uploadingProgress: PropTypes.number,
  rejectMessage: PropTypes.string,
  uploadFailed: PropTypes.bool,
  uploadFailReason: PropTypes.object,
};

LaunchIcon.defaultProps = {
  file: {},
  valid: false,
  uploaded: false,
  isLoading: false,
  id: '',
  rejectMessage: '',
  onDelete: () => {},
  uploadingProgress: 0,
  uploadFailed: false,
  uploadFailReason: {},
};
