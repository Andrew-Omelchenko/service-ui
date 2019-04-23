import { Component } from 'react';
import PropTypes from 'prop-types';
import { fetch } from 'common/utils/fetch';

export class Image extends Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
  };

  static defaultProps = {
    alt: '',
  };

  state = {
    fileURL: null,
  };

  componentDidMount() {
    fetch(this.props.src, { responseType: 'blob' }).then(this.createURL);
  }

  componentWillUnmount() {
    this.revokeURL();
  }

  createURL = (file) => this.setState({ fileURL: URL.createObjectURL(file) });

  revokeURL = () => {
    if (!this.state.fileURL) {
      return;
    }
    URL.revokeObjectURL(this.state.fileURL);
  };

  render() {
    const { src, alt, ...rest } = this.props;

    return <img src={this.state.fileURL} onLoad={this.revokeURL} alt={alt} {...rest} />;
  }
}
