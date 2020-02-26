'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var tslib = require('tslib');
var React = require('react');
var React__default = _interopDefault(React);
var mobx = require('mobx');
var mobxReactLite = require('mobx-react-lite');
var lodash = require('lodash');
var fp = require('lodash/fp');

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function getErrorsFromValidationError(validationError) {
  var FIRST_ERROR = 0;
  return validationError.inner.reduce(function (errors, error) {
    var _extends2;

    return _extends({}, errors, (_extends2 = {}, _extends2[error.path] = error.errors[FIRST_ERROR], _extends2));
  }, {});
}

function validate(schema, values) {
  try {
    schema.validateSync(values, {
      abortEarly: false,
      recursive: true
    });
    return {};
  } catch (error) {
    return getErrorsFromValidationError(error);
  }
}

var Store =
/*#__PURE__*/
function () {
  function Store(props) {
    var _this = this;

    this.touched = {};
    this.errors = {};

    this.setValue = function (key) {
      return function (value) {
        _this.values[key] = value;
      };
    };

    this.touch = function (key) {
      return _this.touched[key] = true;
    };

    this.touchAll = function () {
      return _this.keys.forEach(function (key) {
        _this.touched[key] = true;
      });
    };

    this.updateValues = function (values) {
      return Object.assign(_this.values, fp.pick(_this.keys)(values));
    };

    this.handleChange = function (key) {
      return function (e) {
        _this.setValue(key)(e.target.value);
      };
    };

    this.handleCheckedChange = function (key) {
      return function (e) {
        _this.setValue(key)(e.target.checked);
      };
    };

    this.handleBlur = function (key) {
      return function () {
        _this.touch(key);
      };
    };

    this.getValue = function (key) {
      return _this.values[key];
    };

    this.getError = function (key) {
      return _this.errors[key];
    };

    this.isRequired = function (name) {
      return _this.scheme.fields[name]._exclusive.required;
    };

    this.handleSubmit = function (submit) {
      return function (e) {
        e.preventDefault();

        _this.touchAll();

        if (_this.isValid) {
          submit();
        }
      };
    };

    var scheme = props.scheme,
        initialValues = props.initialValues,
        _props$name = props.name,
        name = _props$name === void 0 ? '' : _props$name;
    this.scheme = scheme;
    this.formName = name;
    this.keys = Object.keys(initialValues);
    this.values = initialValues || {};
    mobx.autorun(function () {
      _this.keys.forEach(function (key) {
        var validation = _this.validations[key];
        var touched = _this.touched[key];

        if (!validation) {
          delete _this.errors[key];
        } else if (touched) {
          _this.errors[key] = validation;
        }
      });
    });
  }

  _createClass(Store, [{
    key: "validations",
    get: function get() {
      return validate(this.scheme, this.values);
    }
  }, {
    key: "isValid",
    get: function get() {
      return lodash.isEmpty(this.validations);
    }
  }]);

  return Store;
}();

tslib.__decorate([mobx.observable], Store.prototype, "values", void 0);

tslib.__decorate([mobx.observable], Store.prototype, "touched", void 0);

tslib.__decorate([mobx.observable], Store.prototype, "errors", void 0);

tslib.__decorate([mobx.computed], Store.prototype, "validations", null);

tslib.__decorate([mobx.computed], Store.prototype, "isValid", null);

tslib.__decorate([mobx.action], Store.prototype, "setValue", void 0);

tslib.__decorate([mobx.action], Store.prototype, "touch", void 0);

tslib.__decorate([mobx.action], Store.prototype, "touchAll", void 0);

tslib.__decorate([mobx.action], Store.prototype, "updateValues", void 0);

tslib.__decorate([mobx.action], Store.prototype, "handleChange", void 0);

tslib.__decorate([mobx.action], Store.prototype, "handleCheckedChange", void 0);

tslib.__decorate([mobx.action], Store.prototype, "handleBlur", void 0);

tslib.__decorate([mobx.action], Store.prototype, "handleSubmit", void 0);

var useForm = function useForm(props) {
  return mobxReactLite.useLocalStore(function (source) {
    return new Store(source);
  }, props);
};
var FormContext =
/*#__PURE__*/
React__default.createContext({});
var useFormContext = function useFormContext() {
  return React.useContext(FormContext);
};
var FormContextProvider = function FormContextProvider(_ref) {
  var children = _ref.children,
      formStore = _ref.formStore;
  return React__default.createElement(FormContext.Provider, {
    value: formStore
  }, children);
};
var FieldContext =
/*#__PURE__*/
React__default.createContext({});
var useFieldContext = function useFieldContext() {
  return React.useContext(FieldContext);
};
var FieldContextProvider =
/*#__PURE__*/
mobxReactLite.observer(function (_ref2) {
  var children = _ref2.children,
      name = _ref2.name;
  var store = React.useContext(FormContext);
  var fieldContext = {
    name: name,
    id: store.formName + "_" + name,
    setValue: store.setValue(name),
    error: store.getError(name),
    value: store.getValue(name),
    onBlur: store.handleBlur(name),
    onChange: store.handleChange(name),
    onCheckedChange: store.handleCheckedChange(name),
    isRequired: store.isRequired(name)
  };
  return React__default.createElement(FieldContext.Provider, {
    value: fieldContext
  }, typeof children === 'function' ? children(fieldContext) : children);
}); // Object.keys(state.errors).forEach(key => {
// if (!has(key)(state.validations)) {
// delete state.errors[key]
// }
// })
// @action validationsToErrors() {
//     Object.keys(state.errors).forEach(key => {
//         if (!has(key)(state.validations)) {
//             delete state.errors[key]
//         }
//     })
//     Object.entries(state.validations).forEach(([key, value]) => {
//         if (state.touched[key]) {
//             state.errors[key] = value
//         }
//     })
// }
// state.validationsToErrors()
// autorun(() => {
//     state.validationsToErrors()
// })
// @observable errors = {} as Errors
// @computed get errors() {
// 	const errors = {} as Errors
// 	Object.entries(this.validations).forEach(([key, value]) => {
// 		if (this.touched[key]) {
// 			errors[key] = value
// 		}
// 	})
// 	return errors
// }
// export function useForm(props: UseForm) {
// 	const state = useLocalStore(source => new Store(source), props)
// 	return {
// 		getValue: state.getValue,
// 		getError: state.getError,
// 		updateValues: state.updateValues,
// 		setValue: state.setValue,
// 		getValues: state.getValues,
// 		isValid: () => state.isValid,
// 		handleChange: state.handleChange,
// 		handleCheckedChange: state.handleCheckedChange,
// 		handleBlur: state.handleBlur,
// 		formName: state.formName,
// 		getFieldProps: state.getFieldProps,
// 		handleSubmit: state.handleSubmit,
// 		isRequired: state.isRequired,
// 	}
// }

exports.FieldContextProvider = FieldContextProvider;
exports.FormContextProvider = FormContextProvider;
exports.useFieldContext = useFieldContext;
exports.useForm = useForm;
exports.useFormContext = useFormContext;
//# sourceMappingURL=mobx-hooks-form.cjs.development.js.map