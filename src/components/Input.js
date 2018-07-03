import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './Input.less';

const noop = () => {};

const Input = ({ type, placeholder, iconLeft, iconRight, onChange, onFocus, onBlur }) => {
  return (
    <div className={styles.inputField}>
      {
        iconLeft &&
        <span className="input-icon">
          <img src={require(`../assets/icons/${iconLeft}.svg`)} alt="" />
        </span>
      }
      <input type={type}
             className={classnames({nopadL: !!iconLeft, nopadR: !!iconRight})}
             placeholder={placeholder}
             onChange={onChange}
             onFocus={onFocus}
             onBlur={onBlur}
      />
      {
        iconRight &&
        <span className="input-icon">
          <img src={require(`../assets/icons/${iconRight}.svg`)} alt="" />
        </span>
      }
    </div>
  )
};

Input.defaultTypes = {
  type: 'text',
  onChange: noop,
  onFocus: noop,
  onBlur: noop
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  iconLeft: PropTypes.string,
  iconRight: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default Input;
