'use strict';

/**
 * @author Sai Kiran Reddy Damagunta <saikirannikhil007@gmail.com>
 */

/******************* @desc shareseye object literal *******************/
const shareseye = {};

/**
 * @desc it is used to validate JSON schema, developed from the inspiration of @link
 * {@link https://json-schema.org/}.
 */
shareseye.jsonSchema = (function() {
  const _isInteger = function(x) {
    return Number.isInteger ? Number.isInteger(x) : typeof x === 'number' && x % 1 === 0;
  };
  const _isFloat = function(x) {
    return typeof x === 'number' && (x % 1 === 0 || x % 1 !== 0);
  };
  const _isString = function(x) {
    return typeof x === 'string';
  };
  const _isBoolean = function(x) {
    return typeof x === 'boolean';
  };
  const _isObject = function(x) {
    return typeof x === 'object' && x instanceof Object && !Array.isArray(x);
  };
  const _isArray = function(x) {
    return typeof x === 'object' && x instanceof Array && Array.isArray(x);
  };
  const _isFunction = function(x) {
    return typeof x === 'function' && x instanceof Function;
  };
  const validate = function(schema, json, err = []) {

    // if schema is not object
    if (!_isObject(schema)) throw new TypeError('schema argument is not object');

    // if json is not object
    if (!_isObject(json)) {
      err.push({
        property: '',
        value: json,
        type: 'object',
        message: 'Invalid data'
      });
      return err;
    }

    // extra properties
    if (schema.properties) {

      // for-in is faster than Object.keys, Object.values, Object.entries
      for (let eachProperty in json) {
        if (!schema.properties.hasOwnProperty(eachProperty)) {
          err.push({
            property: eachProperty,
            message: 'Extra property found in the JSON'
          });
        }
      }
    }

    // loop each schema property
    for (let eachProperty in schema.properties) {

      // if schema property not exist in json
      if (!json.hasOwnProperty(eachProperty)) {

        // and it is required
        if (schema.properties[eachProperty].required) {
          err.push({
            property: eachProperty,
            message: 'Not found in the JSON'
          });
        }
      } else {

        // type
        if (schema.properties[eachProperty].type === 'integer' || schema.properties[eachProperty].type === 'float') {
          if (schema.properties[eachProperty].type == 'integer' ? !_isInteger(json[eachProperty]) : !_isFloat(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: schema.properties[eachProperty].type,
              message: 'Invalid property value type'
            });
          }

          // minimum inclusive
          if (schema.properties[eachProperty].hasOwnProperty('minimum') && schema.properties[eachProperty].minimum > json[eachProperty]) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              minimum: schema.properties[eachProperty].minimum,
              message: 'Property value doesn\'t satisfy min value constraint'
            });
          }

          // maximum inclusive
          if (schema.properties[eachProperty].hasOwnProperty('maximum') && schema.properties[eachProperty].maximum < json[eachProperty]) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              maximum: schema.properties[eachProperty].maximum,
              message: 'Property value doesn\'t satisfy max value constraint'
            });
          }
        } else if (schema.properties[eachProperty].type === 'string') {
          if (!_isString(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'string',
              message: 'Invalid property value type'
            });
          }

          // value
          if (schema.properties[eachProperty].hasOwnProperty('values') && !schema.properties[eachProperty].values.includes(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              values: schema.properties[eachProperty].values,
              message: 'Property value doesn\'t satisfy allowed values constraint'
            });
          }

          // minlength inclusive
          if (schema.properties[eachProperty].hasOwnProperty('minlength') && schema.properties[eachProperty].minlength > json[eachProperty].length) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              minlength: schema.properties[eachProperty].minlength,
              message: 'Property value doesn\'t satisfy min length constraint'
            });
          }

          // maxlength inclusive
          if (schema.properties[eachProperty].hasOwnProperty('maxlength') && schema.properties[eachProperty].maxlength < json[eachProperty].length) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              maxlength: schema.properties[eachProperty].maxlength,
              message: 'Property value doesn\'t satisfy max length constraint'
            });
          }

          // pattern
          if (schema.properties[eachProperty].hasOwnProperty('pattern') && !new RegExp(schema.properties[eachProperty].pattern).test(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              pattern: schema.properties[eachProperty].pattern.toString(),
              message: 'Invalid property value, it should be matched with pattern '
            });
          }
        } else if (schema.properties[eachProperty].type === 'boolean') {
          if (!_isBoolean(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'boolean',
              message: 'Invalid property value type'
            });
          }
        } else if (schema.properties[eachProperty].type === 'object') {
          if (!_isObject(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'object',
              message: 'Invalid property value type'
            });
          } else {
            const each_err = validate(schema.properties[eachProperty], json[eachProperty]);
            err = err.concat(each_err);
          }
        } else if (schema.properties[eachProperty].type === 'array') {
          if (!_isArray(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'array',
              message: 'Invalid property value type'
            });
          } else {
            for (let i = 0; i < json[eachProperty].length; i++) {
              if (schema.properties[eachProperty].itemstype === 'integer' || schema.properties[eachProperty].itemstype === 'float') {
                if (schema.properties[eachProperty].itemstype === 'integer' ? !_isInteger(json[eachProperty][i]) : !_isFloat(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    type: schema.properties[eachProperty].itemstype,
                    message: 'Invalid property value type'
                  });
                }

                // minimum inclusive
                if (schema.properties[eachProperty].hasOwnProperty('itemsminimum') && schema.properties[eachProperty].itemsminimum > json[eachProperty][i]) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    minimum: schema.properties[eachProperty].itemsminimum,
                    message: 'Property value doesn\'t satisfy min value constraint'
                  });
                }

                // maximum inclusive
                if (schema.properties[eachProperty].hasOwnProperty('itemsmaximum') && schema.properties[eachProperty].itemsmaximum < json[eachProperty][i]) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    maximum: schema.properties[eachProperty].itemsmaximum,
                    message: 'Property value doesn\'t satisfy max value constraint'
                  });
                }
              } else if (schema.properties[eachProperty].itemstype === 'string') {
                if (!_isString(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    type: 'string',
                    message: 'Invalid property value type'
                  });
                }

                // value
                if (schema.properties[eachProperty].hasOwnProperty('itemsvalues') && !schema.properties[eachProperty].itemsvalues.includes(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    values: schema.properties[eachProperty].itemsvalues,
                    message: 'Property value doesn\'t satisfy allowed values constraint'
                  });
                }

                // minlength inclusive
                if (schema.properties[eachProperty].hasOwnProperty('itemsminlength') && schema.properties[eachProperty].itemsminlength > json[eachProperty][i].length) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    minlength: schema.properties[eachProperty].itemsminlength,
                    message: 'Property value doesn\'t satisfy min length constraint'
                  });
                }

                // maxlength inclusive
                if (schema.properties[eachProperty].hasOwnProperty('itemsmaxlength') && schema.properties[eachProperty].itemsmaxlength < json[eachProperty][i].length) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    maxlength: schema.properties[eachProperty].itemsmaxlength,
                    message: 'Property value doesn\'t satisfy max length constraint'
                  });
                }

                // pattern
                if (schema.properties[eachProperty].hasOwnProperty('itemspattern') && !new RegExp(schema.properties[eachProperty].itemspattern).test(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    pattern: schema.properties[eachProperty].itemspattern.toString(),
                    message: 'Invalid property value, it should be matched with pattern '
                  });
                }
              } else if (schema.properties[eachProperty].itemstype === 'object') {
                if (!_isObject(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    type: 'object',
                    message: 'Invalid property value type'
                  });
                } else {
                  const each_err = validate(schema.properties[eachProperty], json[eachProperty][i]);
                  err = err.concat(each_err);
                }
              }
            }
          }
        } else if (schema.properties[eachProperty].type === 'function') {
          if (!_isFunction(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'function',
              message: 'Invalid property value type'
            });
          }
        }
      }
    }

    return err;
  };
  return {
    validate: validate
  };
})();

/**
 * @desc this object is used to show and clear notifications.
 */
shareseye.notify = (function() {
  /**
   * @desc bootstrap-notify plugin.
   * @param {Object} options - font icon name either Material Design or fontawesome.
   * @param {string} options.icon - font icon name either Material Design or fontawesome.
   * @param {string} options.title - This is the title that will be displayed within the notify notification.
   * @param {string} options.message - This is the message that will be displayed within the notify notification.
   * @param {string} options.type - info|success|warning|danger.
   * @param {number} options.delay - If delay is set higher than 0 then the notification will auto-close after the delay period is up. Please keep in mind that delay uses milliseconds so 5000 is 5 seconds.
   * @param {string} options.position - top|bottom This controls where if the notification will be placed at the top or bottom of your element.
   * @param {string} options.align - left|center|right This controls if the notification will be placed in the left, center or right side of the element.
   * @param {boolean} options.dismiss - show or hide close button.
   * @param {string} options.audio - alert|bell|message|pleasant|null.
   * @returns {Object} notify object.
   * {@link http://bootstrap-notify.remabledesigns.com}.
   */
  const show = function(o) {
    const _schema = {
      properties: {
        icon: {
          required: true,
          type: 'string'
        },
        title: {
          required: true,
          type: 'string'
        },
        message: {
          required: true,
          type: 'string'
        },
        type: {
          required: true,
          type: 'string',
          values: ['info', 'success', 'warning', 'danger', 'primary']
        },
        delay: {
          required: true,
          type: 'integer',
          minimum: 0,
          maximum: 1e4
        },
        position: {
          required: true,
          type: 'string',
          values: ['top', 'bottom']
        },
        align: {
          required: true,
          type: 'string',
          values: ['left', 'center', 'right']
        },
        dismiss: {
          required: false,
          type: 'boolean'
        },
        audio: {
          required: false,
          type: 'string',
          values: ['alert', 'attention', 'bell', 'mail', 'message', 'order_alert', 'order_placed', 'pleasant']
        },
        animate: {
          required: false,
          type: 'object'
        },
        template: {
          required: false,
          type: 'string'
        }
      }
    };
    const err = shareseye.jsonSchema.validate(_schema, o);
    if (err.length) throw new Error(JSON.stringify(err));

    const notify_options = {
      icon: o.icon,
      title: o.title,
      message: o.message
    };
    const notify_settings = {
      type: o.type,
      delay: o.delay,
      placement: {
        from: o.position,
        align: o.align
      },
      allow_dismiss: o.dismiss
    };
    if (o.hasOwnProperty('animate')) {
      notify_settings.animate = o.animate;
    }
    if (o.hasOwnProperty('template')) {
      notify_settings.template = o.template;
    }
    const notify = $.notify(notify_options, notify_settings);
    if (o.audio) {
      const url = `https://biz.shareseye.com/tone/${o.audio}.mp3`;
      new Audio(url).play().then(() => console.log(`[Audio] played - ${url}`)).catch(err => console.log(`[shareseye.notify] ${err}`));
    }
    return notify;
  };
  const clear = function() {
    $('[data-notify]').find('[data-notify="dismiss"]').trigger('click');
    return this;
  };
  return {
    show: show,
    clear: clear
  };
})();

/**
 * @desc this object is used to return boolean if new notification can be called, TypeErrorFailed to construct 'Notification': Illegal constructor. Use ServiceWorkerRegistration.showNotification() instead.
 */
shareseye.isNewNotificationSupported = (function() {
  var _value = null;
  const _run = function() {
    try {
      const n = new Notification('', {
        silent: true
      });
      n.onshow = function() {
        n.close();
      };
      return true;
    } catch (_) {
      return false;
    }
  };
  const getValue = function() {
    if (_value == null) {
      _value = _run()
    }
    return _value;
  };
  return getValue;
})();

/**
 * @desc shareseye.init is used to auto initialization of libraries when loading html.
 */
shareseye.init = (function() {

  /**
   * @desc shareseye.init.selectpicker object is used to initialize bootstrap-select.
   * {@link https://developer.snapappointments.com/bootstrap-select/}.
   */
  const selectpicker = function($el = null) {
    if ($el == null) $el = $('[data-init-selectpicker]');
    $el.each(function() {

      // default options
      const options = {
        countSelectedText: function(_numSelected, _numTotal) {
          return '{0} selected';
        }
      };

      const $this = $(this);

      // additional options
      const additionalOptions = $this.data('init-selectpicker');

      // merge the additional options into the standard options and override defaults
      $.extend(true, options, additionalOptions);

      $this.removeClass('hide');

      // initialize selectpicker
      $this.selectpicker(options);
    });
    return this;
  };

  /**
   * @desc shareseye.init.datetimepicker object is used to initialize datatimepicker.
   * {@link https://eonasdan.github.io/bootstrap-datetimepicker/}.
   */
  const datetimepicker = function($el = null) {
    if ($el == null) $el = $('[data-init-datetimepicker]');
    $el.each(function() {

      // default options
      const options = {
        format: 'DD/MM/YYYY',
        date: new Date(),
        icons: {
          time: 'fa fa-clock-o',
          date: 'fa fa-calendar',
          up: 'fa fa-chevron-up',
          down: 'fa fa-chevron-down',
          previous: 'fa fa-chevron-left',
          next: 'fa fa-chevron-right',
          today: 'fa fa-screenshot',
          clear: 'fa fa-trash',
          close: 'fa fa-remove',
          inline: true
        },
        ignoreReadonly: true
      };

      const $this = $(this);

      // mobile keyboard triggered false
      $this.attr('readonly', true);

      // additional options
      const additionalOptions = $this.data('init-datetimepicker');
      if (additionalOptions.hasOwnProperty('date')) additionalOptions.date = new Date(additionalOptions.date);

      // merge the additional options into the standard options and override defaults
      $.extend(true, options, additionalOptions);

      // initialize datetimepicker
      $this.datetimepicker(options);
    });
    return this;
  };

  /**
   * @desc shareseye.init.daterangepicker object is used to initialize datatimepicker.
   * {@link http://www.daterangepicker.com/}.
   */
  const daterangepicker = function($el = null) {
    if ($el == null) $el = $('[data-init-daterangepicker]');
    $el.each(function() {

      // default options
      const options = {
        locale: {
          format: 'DD/MM/YYYY',
          separator: ' - ',
          cancelLabel: 'Clear',
          applyLabel: 'Apply',
          customRangeLabel: 'Custom Range'
        },
        opens: 'right',
        drops: 'down',
        buttonClasses: 'btn btn-xs',
        applyButtonClasses: 'btn-success',
        cancelClass: 'btn-default',
        timePicker: false,
        startDate: moment(),
        endDate: moment(),
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Before Yesterday': [moment().subtract(2, 'days'), moment().subtract(2, 'days')],
          'This Week': [moment().startOf('week'), moment().endOf('week')],
          'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
          'This Year': [moment().startOf('year'), moment().endOf('year')],
          'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
        }
      };

      const $this = $(this);

      $this.attr('readonly', true);

      // additional options
      const additionalOptions = $this.data('init-daterangepicker');
      additionalOptions.template = `
        <div class="daterangepicker ${additionalOptions.theme}">
          <div class="ranges"></div>
          <div class="drp-calendar left">
            <div class="calendar-table"></div>
            <div class="calendar-time"></div>
          </div>
          <div class="drp-calendar right">
            <div class="calendar-table"></div>
            <div class="calendar-time"></div>
          </div>
          <div class="drp-buttons">
            <span class="drp-selected"></span>
            <button class="cancelBtn" type="button"></button>
            <button class="applyBtn" disabled="disabled" type="button"></button>
          </div>
        </div>
      `;
      if (additionalOptions.hide_ranges) {
        delete options.ranges;
      }

      // merge the additional options into the standard options and override defaults
      $.extend(true, options, additionalOptions);

      if (['primary', 'info', 'success', 'warning', 'danger', 'rose'].indexOf(options.theme, 0) == -1) throw new Error('Invalid theme option');

      // initialize daterangepicker
      $this.daterangepicker(options);
    });
    return this;
  };

  /**
   * @desc shareseye.init.tooltip object is used to initialize tooltip.
   * {@link https://getbootstrap.com/docs/4.0/components/tooltips/}.
   */
  const tooltip = function($el = null) {
    if ($el == null) $el = $('[data-init-tooltip]');
    $el.each(function() {

      // default options
      const options = {};

      const $this = $(this);

      // additional options
      const additionalOptions = $this.data('init-tooltip');

      // merge the additional options into the standard options and override defaults
      $.extend(true, options, additionalOptions);

      // initialize tooltip
      $this.tooltip(options);
    });
    return this;
  };

  /**
   * @desc shareseye.init.tagsinput object is used to initialize tagsinput.
   * {@link https://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/}.
   */
  const tagsinput = function($el = null) {
    if ($el == null) $el = $('[data-init-tagsinput]');
    $el.each(function() {

      // default options
      const options = {};

      const $this = $(this);

      // additional options
      const additionalOptions = $this.data('init-tagsinput');

      // merge the additional options into the standard options and override defaults
      $.extend(true, options, additionalOptions);

      // initialize tooltip
      $this.tagsinput(options);
    });
    return this;
  };

  /**
   * @desc shareseye.init.localTime object is used to convert server time to local time.
   */
  const localtime = function($el = null) {
    if ($el == null) $el = $('[data-init-localtime]');
    $el.each(function() {
      const $this = $(this);
      const options = $this.data('init-localtime');
      if (!options.hasOwnProperty('to')) options.to = -new Date().getTimezoneOffset();
      $this.text(moment(options.date.toJsDate().toTimezone(options.from, options.to)).format(options.format));
    });
    return this;
  };

  return {
    selectpicker: selectpicker,
    datetimepicker: datetimepicker,
    daterangepicker: daterangepicker,
    tooltip: tooltip,
    tagsinput: tagsinput,
    localtime: localtime
  };
})();

/**
 * @desc shareseye.chartist object is used to initialize line and bar charts.
 * {@link https://gionkunz.github.io/chartist-js}.
 */
shareseye.chartist = (function() {
  const _options = {
    scaleMinSpace: 20,
    onlyInteger: true,
    showArea: true,
    showPoint: true,
    stackBars: true,
    chartPadding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 25
    }
  };
  const _initAnimiChart = function(chart) {
    var seq1 = 0,
      delays1 = 40,
      durations1 = 250;
    var seq2 = 0,
      delays2 = 40,
      durations2 = 250;

    chart.on('draw', function(data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point' || data.type == 'label') {
        seq1++;
        data.element.animate({
          opacity: {
            begin: seq1 * delays1,
            dur: durations1,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      } else if (data.type === 'bar') {
        data.element.attr({
          style: 'stroke-width: 30px'
        });
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });
  };
  const _labelInterpolationFnc = function(val) {
    if (val >= 10000000) {
      return (val / 10000000.0).toFixed(2).toNumber().toCurrency() + 'C';
    } else if (val >= 100000) {
      return (val / 100000.0).toFixed(2).toNumber().toCurrency() + 'L';
    } else if (val >= 1000) {
      return (val / 1000.0).toFixed(2).toNumber().toCurrency() + 'K';
    } else {
      return val.toFixed(2).toNumber().toCurrency();
    }
  };
  const initLine = function(id, data, additionalOptions = {}) {
    $.extend(true, _options, {
      axisY: {
        labelInterpolationFnc: _labelInterpolationFnc
      },
      lineSmooth: Chartist.Interpolation.none({}),
      plugins: [Chartist.plugins.ctPointLabels()]
    });

    // merge the additional options into the standard options and override defaults
    $.extend(true, _options, additionalOptions);

    const chart = new Chartist.Line('#' + id, data, _options);
    _initAnimiChart(chart);
    return this;
  };
  const initBar = function(id, data, additionalOptions = {}) {
    $.extend(true, _options, {
      axisY: {
        labelInterpolationFnc: _labelInterpolationFnc
      },
      plugins: [data.series.length ? Chartist.plugins.ctPointLabels() : undefined]
    });

    // merge the additional options into the standard options and override defaults
    $.extend(true, _options, additionalOptions);

    const chart = new Chartist.Bar('#' + id, data, _options);
    _initAnimiChart(chart);
  };
  return {
    initLine: initLine,
    initBar: initBar
  }
})();

/**
 * @desc shareseye.uuid is used to genereate universal unique identifier 4 version.
 * {@link http://stackoverflow.com/posts/2117523/revisions}.
 */
shareseye.uuid = (function() {
  const v4 = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  const isv4 = function(uuid) {
    const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[ab89][0-9a-f]{3}-[0-9a-f]{12}$/);
    return regex.test(uuid);
  };
  return {
    v4: v4,
    isv4: isv4
  }
})();

/**
 * @desc shareseye.loading.
 */
shareseye.loading = {
  blackBubbles: '<div class="shareseye-loading"><svg width="30" viewBox="0 0 40 10"><circle fill="#000" stroke="none" cx="5" cy="5" r="5"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1"></animate></circle><circle fill="#000" stroke="none" cx="20" cy="5" r="5"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2"></animate></circle><circle fill="#000" stroke="none" cx="35" cy="5" r="5"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3"></animate></circle></svg></div>',
  whiteBubbles: '<div class="shareseye-loading"><svg width="30" viewBox="0 0 40 10"><circle fill="#fff" stroke="none" cx="5" cy="5" r="5"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1"></animate></circle><circle fill="#fff" stroke="none" cx="20" cy="5" r="5"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2"></animate></circle><circle fill="#fff" stroke="none" cx="35" cy="5" r="5"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3"></animate></circle></svg></div>'
};

/**
 * @desc shareseye.fullscreen
 */
shareseye.fullscreen = (function() {
  const doc = window.document;
  const docEl = doc.documentElement;
  const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  const request = function() {
    if (!isActive()) requestFullScreen.call(docEl);
  };
  const exit = function() {
    if (isActive()) cancelFullScreen.call(doc);
  };
  const isActive = function() {
    return !(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement);
  };
  const toggle = function() {
    isActive() ? exit() : request();
  };
  return {
    request: request,
    exit: exit,
    isActive: isActive,
    toggle: toggle
  };
})();

/**
 * @desc shareseye.http status code functions which shows notification based on status code.
 */
shareseye.statusCode = function(code = null, notifyObj = {}) {
  switch (code) {
    case 440:
      shareseye.notify.show({
        icon: 'error',
        title: 'Login Time-out',
        message: 'Your session has expired. Please log in again to continue.',
        type: 'danger',
        delay: 3e3,
        position: 'top',
        align: 'right',
        dismiss: true,
        audio: 'alert'
      });
      break;
    case 429:
      shareseye.notify.show({
        icon: 'error',
        title: 'Too Many Requests',
        message: 'Request limit exceeded.',
        type: 'danger',
        delay: 3e3,
        position: 'top',
        align: 'right',
        dismiss: true,
        audio: 'alert'
      });
      break;
    default:
      shareseye.notify.show({
        icon: notifyObj && typeof notifyObj == 'object' && notifyObj.hasOwnProperty('icon') ? notifyObj.icon : 'error',
        title: notifyObj && typeof notifyObj == 'object' && notifyObj.hasOwnProperty('title') ? notifyObj.title : 'Failed',
        message: notifyObj && typeof notifyObj == 'object' && notifyObj.hasOwnProperty('message') ? notifyObj.message : 'Oops! something went wrong, Please try again.',
        type: notifyObj && typeof notifyObj == 'object' && notifyObj.hasOwnProperty('type') ? notifyObj.type : 'danger',
        delay: 3e3,
        position: notifyObj && typeof notifyObj == 'object' && notifyObj.hasOwnProperty('position') ? notifyObj.position : 'top',
        align: notifyObj && typeof notifyObj == 'object' && notifyObj.hasOwnProperty('align') ? notifyObj.align : 'right',
        dismiss: notifyObj && typeof notifyObj == 'object' && notifyObj.hasOwnProperty('dismiss') ? notifyObj.dismiss : true,
        audio: 'alert'
      });
  }
};

/**
 * shareseye math functions
 */
shareseye.math = (function() {
  /**
   * @desc Returns a random number between min (inclusive) and max (inclusive).
   * @param {number} min - min number.
   * @param {number} max - max number.
   * @returns {number} random number.
   */
  const random = function(min, max) {
    const _schema = {
      properties: {
        min: {
          required: true,
          type: 'integer'
        },
        max: {
          required: true,
          type: 'integer'
        }
      }
    };

    const o = {
      min: min,
      max: max
    };
    const err = shareseye.jsonSchema.validate(_schema, o);
    if (err.length) throw new Error(JSON.stringify(err));

    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return {
    random: random
  };
})();

/**
 * @desc shareseye.nprogress extended
 * {@link https://ricostacruz.com/nprogress/}
 */
shareseye.nprogress = (function() {
  const start = function(theme) {
    const _schema = {
      properties: {
        theme: {
          required: true,
          type: 'string',
          values: ['rose', 'danger', 'info', 'success', 'warning', 'primary', 'shareseye']
        }
      }
    };

    const o = {
      theme: theme
    };
    const err = shareseye.jsonSchema.validate(_schema, o);
    if (err.length) throw new Error(JSON.stringify(err));

    NProgress.configure({
      template: `<div class="bar bar-${theme}" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>`
    });
    NProgress.start();
  };

  const stop = function() {
    NProgress.done();
  };

  return {
    start: start,
    stop: stop
  };
})();

/**
 * @desc Lightweight script to detect whether the browser is running in Private mode.
 * {@link https://gist.github.com/jherax/a81c8c132d09cc354a0e2cb911841ff1}
 * @returns {Promise<boolean>}
 */
shareseye.isPrivateMode = function() {
  return new Promise((resolve) => {
    const yes = () => resolve(true); // is in private mode
    const not = () => resolve(false); // not in private mode

    const detectChromeOpera = function() {
      // https://developers.google.com/web/updates/2017/08/estimating-available-storage-space
      const isChromeOpera = /(?=.*(opera|chrome)).*/i.test(navigator.userAgent) && navigator.storage && navigator.storage.estimate;
      if (isChromeOpera) {
        navigator.storage.estimate().then(function(data) {
          return data.quota < 120000000 ? yes() : not();
        });
      }
      return !!isChromeOpera;
    };

    const detectFirefox = function() {
      const isMozillaFirefox = 'MozAppearance' in document.documentElement.style;
      if (isMozillaFirefox) {
        if (indexedDB == null) yes();
        else {
          var db = indexedDB.open('inPrivate');
          db.onsuccess = not;
          db.onerror = yes;
        }
      }
      return isMozillaFirefox;
    };

    const detectSafari = function() {
      const isSafari = navigator.userAgent.match(/Version\/([0-9\._]+).*Safari/);
      if (isSafari) {
        const testLocalStorage = function() {
          try {
            if (localStorage.length) not();
            else {
              localStorage.setItem('inPrivate', '0');
              localStorage.removeItem('inPrivate');
              not();
            }
          } catch (_) {
            // Safari only enables cookie in private mode
            // if cookie is disabled, then all client side storage is disabled
            // if all client side storage is disabled, then there is no point
            // in using private mode
            navigator.cookieEnabled ? yes() : not();
          }
          return true;
        };

        const version = parseInt(isSafari[1], 10);
        if (version < 11) return testLocalStorage();
        try {
          window.openDatabase(null, null, null, null);
          not();
        } catch (_) {
          yes();
        }
      }
      return !!isSafari;
    };

    const detectEdgeIE10 = function() {
      const isEdgeIE10 = !window.indexedDB && (window.PointerEvent || window.MSPointerEvent);
      if (isEdgeIE10) yes();
      return !!isEdgeIE10;
    };

    // when a browser is detected, it runs tests for that browser
    // and skips pointless testing for other browsers.
    if (detectChromeOpera()) return;
    if (detectFirefox()) return;
    if (detectSafari()) return;
    if (detectEdgeIE10()) return;

    // default navigation mode
    return not();
  });
};

/**
 * @desc shareseye.lazy has image and video lazy loading
 * {@link https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/}
 * @returns {Object}
 */
shareseye.lazy = (function() {
  var lazyImages;
  const loadImage = lazyImage => {
    lazyImage.onload = () => {
      lazyImage.src = lazyImage.dataset.osrc;
      lazyImage.onload = null;
    };
    lazyImage.src = lazyImage.dataset.tsrc;
    lazyImage.classList.remove('lazy', 'lazy-active');
  };

  const scroll = {
    isActive: false,
    lazyLoad: function() {
      if (scroll.isActive === false) {
        scroll.isActive = true;

        setTimeout(function() {
          lazyImages.forEach(lazyImage => {
            if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== 'none') {
              loadImage(lazyImage);

              lazyImages = lazyImages.filter(image => image !== lazyImage);

              if (lazyImages.length === 0) {
                window.document.removeEventListener('scroll', scroll.lazyLoad);
                window.removeEventListener('resize', scroll.lazyLoad);
                window.removeEventListener('orientationchange', scroll.lazyLoad);
              }
            }
          });

          scroll.isActive = false;
        }, 200);
      }
    }
  };

  const image = function() {
    console.log(`[lazy.image]`);
    lazyImages = [].slice.call(window.document.querySelectorAll('img.lazy:not(.lazy-active)'));
    lazyImages.forEach(lazyImage => lazyImage.classList.add('lazy-active'));

    if (!!window.IntersectionObserver) {
      const lazyImageObserver = new IntersectionObserver((entries, _observer) => {
        entries.forEach(entry => {
          if (entry.hasOwnProperty('isIntersecting') ? entry.isIntersecting : entry.intersectionRatio > 0) {
            const lazyImage = entry.target;
            loadImage(lazyImage);
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      }, {
        root: null,
        rootMargin: '0px',
        threshold: 0
      });

      lazyImages.forEach(lazyImage => lazyImageObserver.observe(lazyImage));
    } else {
      window.document.addEventListener('scroll', scroll.lazyLoad);
      window.addEventListener('resize', scroll.lazyLoad);
      window.addEventListener('orientationchange', scroll.lazyLoad);
    }
  };

  return {
    image: image
  };
})();

/******************* @desc prototype extend *******************/

/**
 * @prototype
 * @desc htmlspecialchars is used to espace html special characters.
 */
Object.defineProperty(String.prototype, 'htmlspecialchars', {
  value: function() {
    const m = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#x60;'
    };
    return this.replace(/[&<>"'`]/g, function(v) {
      return m[v];
    });
  }
});

/**
 * @prototype
 * @desc convert string to capitalize
 * {@link https://stackoverflow.com/questions/2332811/capitalize-words-in-string}.
 */
Object.defineProperty(String.prototype, 'toCapitalize', {
  value: function() {
    return this.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
});

/**
 * @prototype
 * @desc convert first letter of string to capitalize
 * {@link https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript}.
 */
Object.defineProperty(String.prototype, 'toCapitalizeFirstLetterOnly', {
  value: function() {
    const s = this.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
});

/**
 * @prototype
 * @desc this function is used to remove non digit characters simple reverse of toCurrency.
 */
Object.defineProperty(String.prototype, 'toNumber', {
  value: function() {
    var n = '';
    this.split('').forEach(function(val) {
      if (val == '.') {
        n += val;
        return;
      }
      if (!isNaN(val)) {
        n += val;
      }
    });
    n = this[0] == '-' ? '-' + n : n;
    return parseFloat(n);
  }
});

/**
 * @prototype
 * @desc replace multiple spaces with a single space.
 */
Object.defineProperty(String.prototype, 'reduceWhiteSpace', {
  value: function() {
    return this.replace(/\s\s+/g, ' ');
  }
});

/**
 * @prototype
 * @desc convert timestamp to js date, db timestamp in format `DD-MM-YYYY.HH:MM:SS`.
 */
Object.defineProperty(String.prototype, 'toJsDate', {
  value: function() {
    const regex = new RegExp(/^[0-9]{2}-[0-9]{2}-[0-9]{4}.[0-9]{2}:[0-9]{2}:[0-9]{2}$/);
    if (!regex.test(this)) throw new Error(`${this} is not in the format of shareseye timestamp`);

    const s = this.split('.');
    const d = s[0].split('-').map(Number);
    const t = s[1].split(':').map(Number);
    // `YYYY, MM, DD, HH, MM, SS`, JavaScript counts months from 0
    return new Date(d[2], d[1] - 1, d[0], t[0], t[1], t[2]);
  }
});

/**
 * @prototype
 * @desc used to trim if length exceededs length
 */
Object.defineProperty(String.prototype, 'toEllipsis', {
  value: function(len) {
    const dotc = 3;

    const _schema = {
      properties: {
        len: {
          required: true,
          type: 'integer',
          minimum: dotc + 1
        }
      }
    };
    const o = {
      len: len
    };
    const err = shareseye.jsonSchema.validate(_schema, o);
    if (err.length) throw new Error(JSON.stringify(err));

    if (this.length > len) {
      return this.substring(0, len - dotc) + '.'.repeat(dotc);
    } else {
      return this;
    }
  }
});

/**
 * @prototype
 * @desc get duration of js Date object.
 * @param {Object} end end date.
 * @returns {Array} array of duration.
 */
Object.defineProperty(Date.prototype, 'getDuration', {
  value: function(end = new Date()) {
    if (!(end instanceof Date)) throw new Error('argument is not Date object');

    const diff = moment.duration(moment(end).diff(moment(this)))._data;
    const arr = Object.keys(diff).reverse();
    arr.pop();
    const getType = type => {
      var r;
      switch (type) {
        case 'seconds':
          r = 'secs';
          break;
        case 'minutes':
          r = 'mins';
          break;
        case 'seconds':
          r = 'secs';
          break;
        case 'hours':
          r = 'hrs';
          break;
        case 'months':
          r = 'mons';
          break;
        default:
          r = type;
          break;
      }
      return r;
    };
    return arr.reduce((res, type, _index, _arr) => {
      if (diff[type]) res.push(diff[type] + ' ' + (diff[type] == 1 ? getType(type).slice(0, -1) : getType(type)));
      return res;
    }, []);
  }
});

/**
 * @prototype
 * @desc convert date object from one timezone to another.
 * @param {number} from from timezone offset value example +5:30 should be 330.
 * @param {number} to to timezone offset value.
 * @returns {Object} date object.
 */
Object.defineProperty(Date.prototype, 'toTimezone', {
  value: function(from, to = -new Date().getTimezoneOffset()) {
    const ms = this.getTime() - from * 6e4 + to * 6e4;
    return new Date(ms);
  }
});

/**
 * @prototype
 * @desc convert amount to curreny representator
 * {@link https://stackoverflow.com/questions/16037165/displaying-a-number-in-indian-format-using-javascript}.
 * {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString}.
 */
Object.defineProperty(Number.prototype, 'toCurrency', {
  value: function() {
    const s = window.document.createElement('span');
    s.innerHTML = '&#8377;';
    return s.innerText + this.toLocaleString('en-IN');
  }
});

/**
 * @prototype
 * @desc find number of decimals
 * {@link https://stackoverflow.com/questions/17369098/simplest-way-of-getting-the-number-of-decimals-in-a-number-in-javascript}.
 */
Object.defineProperty(Number.prototype, 'countDecimals', {
  value: function() {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split('.')[1].length || 0;
  }
});

/**
 * @prototype
 * @desc An simple module to convert numbers to words for South Asian numbering system. e.g. Two crore four lakh
 * {@link https://www.npmjs.com/package/num-words}.
 */
Object.defineProperty(Number.prototype, 'toWords', {
  value: function() {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const regex = /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/;

    var num = Math.trunc(this);

    // does not support converting more than 9 digits yet
    if ((num = num.toString()).length > 9) throw new Error('overflow');

    const n = ('000000000' + num).substr(-9).match(regex);
    if (!n) return;

    var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    return str.trim();
  }
});

/**
 * @prototype
 * @desc custom async for each function.
 * @param {Function} cbk callback function for async forEach.
 */
Object.defineProperty(Array.prototype, 'asyncForEach', {
  value: async function(cbk) {
    for (let i = 0; i < this.length; i++) await cbk(this[i], i, this);
  }
});

/**
 * @prototype
 * @desc this will remove duplicates and return new array.
 */
Object.defineProperty(Array.prototype, 'unique', {
  value: function() {
    return Array.from(new Set(this));
  }
});

/**
 * @prototype
 * @desc Array.prototype.flat() not implemented in chrome less than 69 verision.
 * @param {number} depth The depth level specifying how deep a nested array structure should be flattened. Defaults to 1.
 */
if (!Array.prototype.flat) {
  Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      if (typeof depth != 'number') return this;
      depth = Math.trunc(depth);
      if (!depth) return this;
      return this.reduce(function(preVal, curVal) {
        return preVal.concat(Array.isArray(curVal) ? curVal.flat(depth - 1) : curVal);
      }, []);
    }
  });
}

/**
 * @prototype
 * @desc this will help to rename key of an object.
 * @param {string} oldName old key name of an object.
 * @param {string} newName new key name of an object.
 * {@link https://stackoverflow.com/questions/4647817/javascript-object-rename-key}
 */
Object.defineProperty(Object.prototype, 'renameProperty', {
  value: function(oldName, newName) {

    // do nothing if old key is not defined in object
    if (!this.hasOwnProperty(oldName)) {
      return this;
    }

    // do nothing if the names are the same
    if (oldName === newName) {
      return this;
    }

    this[newName] = this[oldName];
    delete this[oldName];
    return this;
  }
})

/******************* @desc jquery function *******************/

/**
 * @desc initdataTable for customize datatable more easily.
 * {@link https://datatables.net}.
 */
if (typeof $.fn.dataTable === 'function') {
  $.fn.dataTable.ext.legacy.ajax = true;
  $.fn.DataTable.ext.pager.numbers_length = 11;

  // fixedHeader adjust - this code is used for fixed header issue when multiple datatables in single page
  $('[data-toggle="tab"]').on('shown.bs.tab', function (_event) {
    $('.dataTables_wrapper').toArray().forEach(each => $(each).find('table').dataTable().api().fixedHeader.adjust());
  });
}
$.fn.initdataTable = function(ao = {}) {

  // default options
  const o = {
    pagingType: 'full_numbers',
    lengthMenu: [
      [25, 50, 75, 100, 250, 500],
      ['25', '50', '75', '100', '250', '500']
    ],
    iDisplayLength: 25,
    createdRow: function(row, _data, _dataIndex) {
      $(row).addClass('dataTable-hover');
    },
    initComplete: function(_settings, _json) {
      $('#' + this.attr('id') + '_wrapper').find('label').addClass('form-group');
    },
    language: {
      search: '',
      searchPlaceholder: 'Search',
      sEmptyTable: 'No data available'
    },
    oLanguage: {
      sLengthMenu: 'Displaying _MENU_ records',
    },
    fixedHeader: {
      headerOffset: 6
    }
  };

  if (ao.hasOwnProperty('sAjaxSource') || ao.hasOwnProperty('ajax')) {
    $.extend(true, o, {
      // https://legacy.datatables.net/ref#bProcessing
      bProcessing: true,
      // https://legacy.datatables.net/ref#bServerSide
      bServerSide: true
    });
  }

  // merge the additional options into the standard options and override defaults
  $.extend(true, o, ao);

  this.dataTable(o);

  // records selectpicker
  const name = this.attr('id') + '_length';
  const $select = $(`[name="${name}"]`);
  shareseye.init.selectpicker($select);

  // selectpicker btn change css
  $('#' + name).find('button').removeClass('btn-default').addClass('select-with-transition').find('.filter-option').addClass('fs-14');

  return this;
};

/**
 * @desc data table error mode.
 */
if ($.fn.dataTable) {
  $.fn.dataTable.ext.errMode = function(settings, _techNote, message) {
    if (settings.jqXHR && settings.jqXHR.status == 440) {
      shareseye.statusCode(440);
      setTimeout(() => window.location.href = 'logout', 3e3);
    } else {
      throw new Error(message);
    }
  };
}

/**
 * @desc form serializeObject.
 * {@link https://stackoverflow.com/questions/17488660/difference-between-serialize-and-serializeobject-jquery}.
 * @param {Array} names - A array or string contaning required names.
 * @returns {Object} form object.
 */
$.fn.serializeObject = function(names = []) {
  const _schema = {
    properties: {
      names: {
        required: true,
        type: 'array',
        itemstype: 'string',
        itemspattern: /^[a-z0-9_@]{1,}$/
      }
    }
  };

  const o = {
    names: names
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const a = this.serializeArray();

  // checkbox if checked serializeArray will give value as 'on' if not checked it wont give entry
  $(this).find('input[type=checkbox]').get().forEach(function(e) {
    const index = a.findIndex(each => each.name == e.name);
    if (index == -1) {
      a.push({
        name: e.name,
        value: e.checked
      });
    } else {
      a[index].value = e.checked;
    }
  });

  // return object
  const obj = {};
  a.forEach(function(e) {
    if (!names.length || names.includes(e.name)) {

      // check if e.value type is boolean
      if (typeof e.value === 'boolean') {
        obj[e.name] = e.value;
        return;
      }

      // check if e.value is convertible to number
      const v = (!isNaN(e.value) && e.value.length) ? e.value.toNumber() : e.value.trim().reduceWhiteSpace();
      if (obj.hasOwnProperty(e.name)) {
        if (!(obj[e.name] instanceof Array)) obj[e.name] = [obj[e.name]];
        obj[e.name].push(v);
      } else {
        obj[e.name] = v;
      }
    }
  });

  return obj;
};

/**
 * @desc jquery timeAgo plugin in order to update timeAgo.
 * @returns {number} seconds.
 */
$.fn.timeAgo = function() {
  const $this = $(this);

  // standard options
  const options = {
    full: false,
    ago: true,
    diffText: ' ago',
    nodiffText: 'just now'
  };

  // additional options
  const additionalOptions = $this.data('options');

  // merge the additional options into the standard options and override defaults
  $.extend(true, options, additionalOptions);

  if ($this.data('time-ago') == undefined) throw new ReferenceError('time-ago attribute undefined');

  const ago = new Date($this.data('time-ago')); // milliseconds to js date object

  const duration_seconds = options.ago ? new Date().getTime() - ago.getTime() : ago.getTime() - new Date().getTime();
  var duration_arr = options.ago ? ago.getDuration() : new Date().getDuration(ago);
  if (!duration_arr.length) {
    $this.text(options.nodiffText);
    return (duration_seconds / 1000.0).toFixed().toNumber();
  }

  if (!options.full) {
    duration_arr = duration_arr.slice(0, 1);
  }

  $this.text(duration_arr.length ? duration_arr.join(', ') + options.diffText : options.nodiffText);
  return (duration_seconds / 1000.0).toFixed().toNumber();
};

/**
 * @desc jquery validation.
 * {@link https://www.regexpal.com/}.
 */
if ($.validator) {
  $.validator.addMethod('username', function(val, _el, _params) {
    const regex = new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9]{0,}$/);
    return regex.test(val);
  }, function(_params, el) {
    const $el = $(el);
    var returnData;
    if (!new RegExp(/^[a-zA-Z]{1}$/).test($el.val()[0])) {
      returnData = 'First letter should be alphabet';
    } else {
      returnData = 'Allowed only alphabets and numbers.';
    }
    return returnData;
  });

  $.validator.addMethod('phoneIND', function(val, _el, _params) {
    const regex = new RegExp(/^[0-9]{10}$/);
    return regex.test(val);
  }, 'Please specify a valid phone number.');

  $.validator.addMethod('decimalstep', function(val, _el, params) {
    if (Math.floor(val) === Number(val)) return true;
    return val.toString().split('.')[1].length <= params ? true : false;
  }, 'Max {0} decimals allowed.');

  $.validator.addMethod('duplicate', function(val, _el, params) {
    params = params.map(function(val) {
      if (!isNaN(val)) val = val.toString();
      return val.trim().reduceWhiteSpace().toUpperCase();
    });
    return params.indexOf(val.trim().reduceWhiteSpace().toUpperCase(), 0) == -1 ? true : false;
  }, 'Duplicate entry found.');

  $.validator.addMethod('allowedValues', function(val, _el, params) {
    return params.indexOf(val.toNumber(), 0) == -1 ? false : true;
  }, 'Not allowed.');

  $.validator.addMethod('lettersonly', function(val, _el, _params) {
    return new RegExp(/^[a-zA-Z]{0,}$/).test(val);
  }, 'Allowed only alphabets.');

  $.validator.addMethod('nalphabets', function(val, _el, params) {
    const pattern = `[a-zA-Z]{${params}}`;
    return new RegExp(pattern).test(val);
  }, 'Should contain at least ${0} alphabet.');

  $.validator.addMethod('alphanumeric', function(val, _el, _params) {
    if (val.length) {
      const regex = new RegExp(/^[a-zA-Z0-9]{1,}$/);
      return regex.test(val);
    } else {
      return true;
    }
  }, 'Allowed only alphabets and numbers.');

  $.validator.addMethod('atleastOneAlphabet', function(val, _el, _params) {
    if (val.length) {
      const regex = new RegExp(/[a-z]{1,}/i);
      return regex.test(val);
    } else {
      return true;
    }
  }, 'Atleast 1 alphabet is required.');

  $.validator.addMethod('custom', function(_val, _el, params) {
    return params;
  }, '');
}

/**
 * @desc jquery tagName.
 */
$.fn.tagName = function() {
  return $(this).prop('tagName').toLowerCase();
};

/**
 * @desc is scroll bar present or not.
 * {@link https://stackoverflow.com/questions/4814398/how-can-i-check-if-a-scrollbar-is-visible}.
 * {@link https://stackoverflow.com/questions/22675126/what-is-offsetheight-clientheight-scrollheight}.
 * @param {string} direction - A string contaning vertical or horizontal.
 * @returns {boolean} true or false.
 */
$.fn.hasScrollBar = function(direction) {
  const _schema = {
    properties: {
      direction: {
        required: true,
        type: 'string',
        values: ['vertical', 'horizontal'],
      }
    }
  };

  const o = {
    direction: direction
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const that = this.get(0);
  return direction === 'vertical' ? that.scrollHeight > that.clientHeight : that.scrollWidth > that.clientWidth;
};

/**
 * @desc shake ui element to get user attention.
 * @param {number} delay - delay between each shake.
 * @param {number} range - range of shake.
 * @param {number} times - times of shake.
 */
$.fn.shake = function(delay = 25, range = 10, times = 10) {
  const that = this;
  const run = function() {
    if (!times) {
      that.css('transform', '');
      return;
    }
    times--;
    that.css('transform', `translate3d(${shareseye.math.random(-range, range)}px, ${shareseye.math.random(-range, range)}px, 0px)`);
    setTimeout(run, delay);
  };
  run();
};

/******************* @desc jquery widget *******************/
if ($.widget) {}

/******************* @desc javascript prototypes *******************/

/**
 * @class long polling
 * @classdesc this class is used to perform long polling.
 * @param {string} url A string containing the URL to which the request is to be send.
 * @param {Function} scbk custom success callback function.
 * @param {number} delay gap between each ajax calls in milliseconds.
 */
const LongPolling = function(url, scbk, delay) {

  // if called class without new
  if (!(this instanceof LongPolling)) throw new Error(`Class constructor LongPolling cannot be invoked without 'new'`);

  // arguments validation
  const _schema = {
    properties: {
      url: {
        required: true,
        type: 'string'
      },
      scbk: {
        required: true,
        type: 'function'
      },
      delay: {
        required: true,
        type: 'integer'
      }
    }
  };
  const o = {
    url: url,
    scbk: scbk,
    delay: delay
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  this._url = url;
  this._scbk = scbk;
  this._delay = delay;
  this._pull = null;
  this._jqXHR;
  this._isActive = false; // if true `start` state, if false `stop` state

  this.data = {};
  this.headers = null;

  // network events
  const that = this;

  // this should be there because if start is not called even once and network event change and comes to online it shouldn't start
  var isStoppedWhenWentOffline = false;
  window.addEventListener('offline', () => {
    console.log('[debugg]', that._url, 'offline')
    if (this._isActive) {
      that.stop();
      isStoppedWhenWentOffline = true;
    }
  });
  window.addEventListener('online', () => {
    console.log('[debugg]', that._url, 'online')
    if (isStoppedWhenWentOffline) {
      that.start();
      isStoppedWhenWentOffline = false;
    }
  });
};

/**
 * @prototype
 * @desc long live ajax call will start in this function.
 */
LongPolling.prototype.start = function() {
  if (!this._isActive) {
    this._isActive = true;
    console.log(`[LongPolling] started - ${this._url}`);
    this._xhr(0);
  } else {
    console.error(`[LongPolling] already started - ${this._url}`);
  }
};

/**
 * @prototype
 * @desc long live ajax call will stop in this function.
 */
LongPolling.prototype.stop = function() {
  if (this._isActive) {
    this._isActive = false;
    if (this._jqXHR) {
      this._jqXHR.abort();
      console.log(`[LongPolling] stopped - ${this._url}`);
    }
  } else {
    console.error(`[LongPolling] already stopped - ${this._url}`);
  }
};

/**
 * @prototype
 * @desc long live ajax call will restart in this function.
 */
LongPolling.prototype.restart = function() {
  this.stop();
  this.start();
};

/**
 * @prototype
 * @desc long live ajax call return active status.
 */
LongPolling.prototype.isActive = function() {
  return this._isActive;
};

/**
 * @prototype
 * @desc long live ajax update deplay.
 * @param {number} delay gap between each ajax calls in milliseconds.
 */
LongPolling.prototype.updateDelay = function(delay) {
  const _schema = {
    properties: {
      delay: {
        required: true,
        type: 'integer'
      }
    }
  };
  const o = {
    delay: delay
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  if (this._delay != delay) {
    this._delay = delay;
    this.restart();
  }
};

/**
 * @prototype
 * @desc ajax call will perform in this function.
 * @param {number} delay gap between each ajax calls in milliseconds.
 */
LongPolling.prototype._xhr = function(delay) {
  const self = this;
  if (self._isActive) {
    setTimeout(function() {

      // data to be passed
      const data = {
        data: JSON.stringify(self.data)
      };
      if (self._pull) data.pull = self._pull;

      // ajax
      var settings = {
        url: self._url,
        type: 'GET',
        async: true,
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function() {},
        success: function(data) {
          if (data.hasOwnProperty('pull')) self._pull = data.pull;
          self._scbk.apply(null, arguments);
        },
        error: function(jqXHR, textStatus) {

          // when status code is zero and server doesn't respond
          if (jqXHR.status === 0 && textStatus == 'error') {
            if (shareseye.onLine) {
              const event = new Event('offline');
              window.dispatchEvent(event);
            }
          } else {
            if (textStatus == 'abort') {
              return;
            } else if (jqXHR.status == 440) {
              shareseye.statusCode(440);
              setTimeout(() => window.location.href = 'logout', 3e3);
              self.stop();
            } else {
              shareseye.statusCode();
            }
          }
        },
        complete: function() {
          self._xhr(self._delay);
        }
      };
      if (self.headers) {
        settings.headers = self.headers;
      }
      self._jqXHR = $.ajax(settings);
    }, delay);
  }
};

/**
 * @class cart
 * @classdesc this class is used for cart operations.
 */
const Cart = function() {

  // if called class without new
  if (!(this instanceof Cart)) throw new Error(`Class constructor Cart cannot be invoked without 'new'`);

  // private variables
  this._bill_id = null;
  this._table = {
    id: null,
    type: null
  };
  this._additional_charge = {
    type: null,
    value: null
  };
  this._service_charge = null;
  this._extra_charge = {
    delivery_charge: null,
    delivery_charge_tax_exclusive: null,
    packing_charge: null
  };
  this._tax = {
    type: null,
    labels: {
      tax_1: '',
      tax_2: '',
      tax_3: ''
    }
  };
  this._offers = [];
  this._items = {};
  this._notes = {
    phone_number: '',
    visits: {}
  };
};

/**
 * @prototype
 * @desc this function is used to set bill id.
 * @param {number} bill_id A integer containing the bill id to be set on cart.
 */
Cart.prototype.setBillId = function(bill_id) {
  const _schema = {
    properties: {
      bill_id: {
        required: true,
        type: 'integer'
      }
    }
  };

  const o = {
    bill_id: bill_id
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  this._bill_id = bill_id;
  return this;
};

/**
 * @prototype
 * @desc this function is used to get bill id.
 * @returns {number} bill_id.
 */
Cart.prototype.getBillId = function() {
  return this._bill_id;
};

/**
 * @prototype
 * @desc this function is used to get bill number.
 * @returns {number} bill_number.
 */
Cart.prototype.getBillNumber = function() {
  return this._bill_id.toString().substr(6);
};

/**
 * @prototype
 * @desc this function is used to get order number.
 * @param {number} order_id order id of items.
 * @returns {number} order_number.
 */
Cart.prototype.getOrderNumber = function(order_id) {
  const _schema = {
    properties: {
      order_id: {
        required: true,
        type: 'integer'
      }
    }
  };

  const o = {
    order_id: order_id
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  return order_id.toString().substr(6).toNumber();
};

/**
 * @prototype
 * @desc this function is used to set table id and table type.
 * @param {Object} table table object.
 * @param {string} table.id A string containing the table id to be set on cart.
 * @param {number} table.type A integer containing the table type to be set on cart.
 */
Cart.prototype.setTable = function(table) {
  const _schema = {
    properties: {
      id: {
        required: true,
        type: 'string',
        pattern: /^[A-Z]{1,4}[0-9]{1,}$/
      },
      type: {
        required: true,
        type: 'integer',
        minimum: 1,
        maximum: 40
      }
    }
  };

  const err = shareseye.jsonSchema.validate(_schema, table);
  if (err.length) throw new Error(JSON.stringify(err));

  this._table = {
    ...table
  };

  return this;
};

/**
 * @prototype
 * @desc this function is used to get table id and table type.
 * @returns {Object} table_id and table_type.
 */
Cart.prototype.getTable = function() {
  return {
    ...this._table
  };
};

/**
 * @function
 * @desc this function is used to get display table_id.
 * @param {Object} table table object.
 * @param {string} table.id A string containing the table id.
 * @param {number} table.type A integer containing the table type.
 * @returns {string} view_table_id.
 */
Cart.getViewTableId = function(table) {
  const _schema = {
    properties: {
      id: {
        required: true,
        type: 'string',
        pattern: /^[A-Z]{1,4}[0-9]{1,}$/
      },
      type: {
        required: true,
        type: 'integer',
        minimum: 1,
        maximum: 40
      }
    }
  };

  const err = shareseye.jsonSchema.validate(_schema, table);
  if (err.length) throw new Error(JSON.stringify(err));

  table = {
    ...table
  };
  if ((table.type >= 1 && table.type <= 5) || (table.type >= 7 && table.type <= 11)) {
    table.id = table.id.substring(1, table.id.length);

    if (!new RegExp(/^(K|A)[0-9]{1,}$/).test(table.id)) {
      table.id = table.id.substring(1, table.id.length);
    }
  }
  return table.id;
};

/**
 * @prototype
 * @desc this function is used to get table text.
 * @param {Object} table table object.
 * @param {string} table.id A string containing the table id.
 * @param {number} table.type A integer containing the table type.
 * @param {array} custom_tables An array of custom_tables.
 * @param {number} custom_tables[].id custom_table id.
 * @param {string} custom_tables[].name custom table name.
 * @returns {string} table_text.
 */
Cart.getViewTableText = function(table, custom_tables) {
  const _schema = {
    properties: {
      id: {
        required: true,
        type: 'string',
        pattern: /^[A-Z]{1,4}[0-9]{1,}$/
      },
      type: {
        required: true,
        type: 'integer',
        minimum: 1,
        maximum: 40
      },
      custom_tables: {
        required: true,
        type: 'array',
        itemstype: 'object',
        properties: {
          id: {
            required: true,
            type: 'integer'
          },
          name: {
            required: true,
            type: 'string'
          }
        }
      }
    }
  };

  const o = {
    ...table,
    custom_tables: custom_tables
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  var returnData = '';
  if ((table.type >= 1 && table.type <= 5) || (table.type >= 7 && table.type <= 11)) {
    if (new RegExp(/^[A-Z]{1}M[0-9]{1,}$/).test(table.id) || new RegExp(/^[A-Z]{1}K[0-9]{1,}$/).test(table.id) || new RegExp(/^[A-Z]{1}A[0-9]{1,}$/).test(table.id)) {
      switch (table.type) {
        case 1:
        case 3:
        case 7:
          returnData = 'Table';
          break;
        case 2:
          returnData = 'Queue';
          break;
        case 4:
          returnData = 'Seat';
          break;
        case 5:
          returnData = 'Car';
          break;
        default:
          returnData = 'Queue';
          break;
      }
    } else if (new RegExp(/^[A-Z]{1}(M|K|A|W)HD[0-9]{1,}$/).test(table.id)) {
      returnData = 'Home Delivery';
    } else if (new RegExp(/^[A-Z]{1}(M|K|A|W)TA[0-9]{1,}$/).test(table.id)) {
      returnData = 'Take Away';
    } else if (new RegExp(/^[A-Z]{1}(K|A|W)RO[0-9]{1,}$/).test(table.id)) {
      returnData = 'Room';
    }
  } else if (table.type == 6) {
    if (new RegExp(/^ZO[0-9]{1,}$/).test(table.id)) {
      returnData = 'Zomato';
    } else if (new RegExp(/^FP[0-9]{1,}$/).test(table.id)) {
      returnData = 'Foodpanda';
    } else if (new RegExp(/^SW[0-9]{1,}$/).test(table.id)) {
      returnData = 'Swiggy';
    } else if (new RegExp(/^UE[0-9]{1,}$/).test(table.id)) {
      returnData = 'Uber Eats';
    }
  } else if (table.type >= 31 && table.type <= 40) {
    const data = custom_tables.find(each => each.id == table.type);
    returnData = data ? data.name.toCapitalize() : 'Custom';
  }
  return returnData;
};

/**
 * @prototype
 * @desc this function is used to get table group text.
 * @param {Object} table table object.
 * @param {string} table.id A string containing the table id.
 * @param {number} table.type A integer containing the table type.
 * @returns {string} table_group_text.
 */
Cart.getViewTableGroupText = function(table) {
  const _schema = {
    properties: {
      id: {
        required: true,
        type: 'string',
        pattern: /^[A-Z]{1,4}[0-9]{1,}$/
      },
      type: {
        required: true,
        type: 'integer',
        minimum: 1,
        maximum: 40
      }
    }
  };

  const o = table;
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  var returnData = '';
  if ((table.type >= 1 && table.type <= 5) || (table.type >= 7 && table.type <= 11)) {
    if (new RegExp(/^[A-Z]{1}(K(|TA|HD|RO))[0-9]{1,}$/).test(table.id)) {
      returnData = 'shareseye';
    } else if (new RegExp(/^[A-Z]{1}(A(|TA|HD|RO))[0-9]{1,}$/).test(table.id)) {
      returnData = 'App';
    } else if (new RegExp(/^[A-Z]{1}(W(TA|HD|RO))[0-9]{1,}$/).test(table.id)) {
      returnData = 'Website';
    } else {
      returnData = 'POS';
    }
  } else if (table.type == 6) {
    returnData = '3rd Party';
  } else if (table.type >= 31 && table.type <= 40) {
    returnData = 'Custom';
  }
  return returnData;
};

/**
 * @prototype
 * @desc this function is used to set additional charge.
 * @param {Object} additional_charge charge object.
 * @param {number} additional_charge.type amount(1) | percentage(2).
 * @param {number} additional_charge.value how much cost or how much percentage.
 */
Cart.prototype.setAdditionalCharge = function(additional_charge) {
  const _schema = {
    properties: {
      type: {
        required: true,
        type: 'integer',
        minimum: 1,
        maximum: 2
      },
      value: {
        required: true,
        type: 'integer',
        minimum: 0,
        maximum: 100
      }
    }
  };

  const err = shareseye.jsonSchema.validate(_schema, additional_charge);
  if (err.length) throw new Error(JSON.stringify(err));

  this._additional_charge = {
    ...additional_charge
  };
  return this;
};

/**
 * @prototype
 * @desc this function is used to get additional charge.
 * @returns {Object} additional_charge.
 */
Cart.prototype.getAdditionalCharge = function() {
  return {
    ...this._additional_charge
  };
};

/**
 * @prototype
 * @desc this function is used to set service charge.
 * @param {number} service_charge the percentage you wish to charge on item cost.
 */
Cart.prototype.setServiceCharge = function(service_charge) {
  const _schema = {
    properties: {
      service_charge: {
        required: true,
        type: 'float',
        maximum: 10.00
      }
    }
  };

  const o = {
    service_charge: service_charge
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  this._service_charge = service_charge;
  return this;
};

/**
 * @prototype
 * @desc this function is used to get service charge.
 * @returns {number} service_charge.
 */
Cart.prototype.getServiceCharge = function() {
  return this._service_charge;
};

/**
 * @prototype
 * @desc this function is used to set extra charge.
 * @param {Object} extra_charge charge object.
 * @param {number} extra_charge.delivery_charge delivery charge.
 * @param {number} extra_charge.delivery_charge_tax_exclusive delivery charge tax exclusive.
 * @param {number} extra_charge.packing_charge packing charge.
 */
Cart.prototype.setExtraCharge = function(extra_charge) {
  const _schema = {
    properties: {
      delivery_charge: {
        required: true,
        type: 'integer'
      },
      delivery_charge_tax_exclusive: {
        required: true,
        type: 'float'
      },
      packing_charge: {
        required: true,
        type: 'integer'
      }
    }
  };

  const err = shareseye.jsonSchema.validate(_schema, extra_charge);
  if (err.length) throw new Error(JSON.stringify(err));

  this._extra_charge = {
    ...extra_charge
  };
  return this;
};

/**
 * @prototype
 * @desc this function is used to get extra_charge.
 * @returns {Object} extra_charge object of properties delivery_charge and packing_charge.
 */
Cart.prototype.getExtraCharge = function() {
  return {
    ...this._extra_charge
  };
};

/**
 * @prototype
 * @desc this function is used to set tax type.
 * @param {number} tax_type either inclusive - 0 or exclusive - 1.
 */
Cart.prototype.setTaxType = function(tax_type) {
  const _schema = {
    properties: {
      tax_type: {
        required: true,
        type: 'integer',
        minimum: 0,
        maximum: 1
      }
    }
  };

  const o = {
    tax_type: tax_type
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  this._tax.type = tax_type;
  return this;
};

/**
 * @prototype
 * @desc this function is used to get tax type.
 * @returns {number} tax_type either inclusive - 0 or exclusive - 1.
 */
Cart.prototype.getTaxType = function() {
  return this._tax.type;
};

/**
 * @prototype
 * @desc this function is used to set tax labels.
 * @param {string} obj.tax_1 tax_1 label name.
 * @param {string} obj.tax_2 tax_2 label name.
 * @param {string} obj.tax_3 tax_3 label name.
 */
Cart.prototype.setTaxLabels = function(o) {
  const _schema = {
    properties: {
      tax_1: {
        required: true,
        type: 'string',
        maxlength: 5
      },
      tax_2: {
        required: true,
        type: 'string',
        maxlength: 5
      },
      tax_3: {
        required: true,
        type: 'string',
        maxlength: 5
      }
    }
  };

  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const that = this;
  Object.entries(o).forEach(([key, value]) => that._tax.labels[key] = value);
  return this;
};

/**
 * @prototype
 * @desc this function is used to get tax label.
 * @param {string} key A string to get tax_label.
 * @returns {string} tax_label.
 */
Cart.prototype.getTaxLabel = function(key) {
  const _schema = {
    properties: {
      key: {
        required: true,
        type: 'string',
        values: ['tax_1', 'tax_2', 'tax_3']
      }
    }
  };

  const o = {
    key: key
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  return this._tax.labels[key];
};

/**
 * @prototype
 * @desc this function is used to assign key value pairs in _notes object of cart.
 * @param {string} key key.
 * @param {string|integer|boolean|Array|Object} value value of key.
 */
Cart.prototype.notes = function(key, value) {
  const _schema = {
    properties: {
      key: {
        required: true,
        type: 'string'
      }
    }
  };

  const o = {
    key: key
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  if (arguments.length === 1) {
    return this._notes[key];
  } else {
    this._notes[key] = value;
  }
};

/**
 * @prototype
 * @desc this function is used to add offer on cart.
 * @param {number} oid offer id.
 * @param {string} name offer name.
 * @param {string} description offer description.
 * @param {string} img_url offer image url from aws s3 bucket.
 * @param {number} offer_type offer type overall(1) | buyx_gety(2).
 * @param {number} offer_by shareseye(1) | self(2).
 * @param {number} coupon if empty then it is applied automatically else offer will be applied with only coupon.
 * @param {Object} discount discount object.
 * @param {number} discount.on discount on item_cost(1) | size(2).
 * @param {number} discount.value discount value.
 * @param {string} time time string.
 * @param {Object} filters filters object.
 * @param {number} filters.limits max value (2147483647), If -1 then there is no limit.
 * @param {Object} filters.menu_code menu code filters for this offer.
 * @param {Array} filters.menu_code.list menu code which to be included for this offer.
 * @param {Object} filters.menu_code.visits menu code visits filter object.
 * @param {number} filters.menu_code.visits.min minimum visit for menu_code max value (65535).
 * @param {number} filters.menu_code.visits.max maximum vist for menu_code max value (2147483647), If -1 then there is no need to consider max visits.
 * @param {Array} phone offer will be applied to only theses phone number if empty this offer can used by any one.
 * @param {Array} platform manual(1) | digital(2) | nearby(3) | app(4) | website(5).
 * @param {Array} order_type dine(1) | take_away(2) | home_delivery(3) | room(4).
 * @param {number} timezoneoffset timezone offset, https://en.wikipedia.org/wiki/List_of_UTC_time_offsets.
 * @param {string} start_date start date in the format of DD-MM-YYYY.
 * @param {string} end_date end date in the format of DD-MM-YYYY.
 * @param {string} start_time start time in the format of HH:II:SS.
 * @param {string} end_time end time in the format of HH:II:SS.
 * @param {Array} days sunday(1) | monday(2) | tuesday(3) | wednesday(4) | thursday(5) | friday(6) | saturday(7).
 * @param {Object} conditions conditions object varies based on type.
 * {@link https://wiki.morseteam.in/offers.md}.
 */
Cart.prototype.addOffer = function(offerObj) {
  var _schema = {
    properties: {
      oid: {
        required: true,
        type: 'integer'
      },
      name: {
        required: true,
        type: 'string',
        maxlength: 30
      },
      description: {
        required: true,
        type: 'string',
        maxlength: 200
      },
      img_url: {
        required: true,
        type: 'string',
        maxlength: 69 // https://shareseye.s3.amazonaws.com/offers/01234567890123456789-small.jpeg
      },
      offer_type: {
        required: true,
        type: 'integer',
        minimum: 1,
        maximum: 2
      },
      offer_by: {
        required: true,
        type: 'integer',
        minimum: 1,
        maximum: 2
      },
      coupon: {
        required: true,
        type: 'string',
        minlength: 0,
        maxlength: 15
      },
      discount: {
        required: true,
        type: 'object',
        properties: {
          on: {
            required: true,
            type: 'integer',
            minimum: 1,
            maximum: 2
          },
          value: {
            required: true,
            type: 'float'
          }
        }
      },
      time: {
        required: false,
        type: 'string',
        pattern: /^([0-9]{2}-){2}[0-9]{4}.([0-9]{2}:){2}[0-9]{2}$/
      },
      filters: {
        required: true,
        type: 'object',
        properties: {
          limits: {
            required: true,
            type: 'integer',
            minimum: -1,
            maximum: 2147483647
          },
          menu_code: {
            required: true,
            type: 'object',
            properties: {
              list: {
                required: true,
                type: 'array',
                itemstype: 'string',
                itemspattern: /^[A-Za-z]{2}[0-9]{1,}$/
              },
              visits: {
                required: true,
                type: 'object',
                properties: {
                  min: {
                    required: true,
                    minimum: 0,
                    maximum: 65535
                  },
                  max: {
                    required: true,
                    minimum: -1,
                    maximum: 2147483647
                  }
                }
              }
            }
          },
          phone: {
            required: true,
            type: 'array',
            itemstype: 'string',
            itemspattern: /^[0-9]{10}$/
          },
          platform: {
            required: true,
            type: 'array',
            itemstype: 'integer',
            itemsminimum: 1,
            itemsmaximum: 5
          },
          order_type: {
            required: true,
            type: 'array',
            itemstype: 'integer',
            itemsminimum: 1,
            itemsmaximum: 5
          },
          timezoneoffset: {
            required: true,
            type: 'integer',
            minimum: -720,
            maximum: 840
          },
          start_date: {
            required: true,
            type: 'string',
            pattern: /^([0-9]{2}-){2}[0-9]{4}$/
          },
          end_date: {
            required: true,
            type: 'string',
            pattern: /^([0-9]{2}-){2}[0-9]{4}$/
          },
          start_time: {
            required: true,
            type: 'string',
            pattern: /^([0-9]{2}:){2}[0-9]{2}$/
          },
          end_time: {
            required: true,
            type: 'string',
            pattern: /^([0-9]{2}:){2}[0-9]{2}$/
          },
          days: {
            required: true,
            type: 'array',
            itemstype: 'integer',
            itemsminimum: 1,
            itemsmaximum: 7
          }
        }
      },
      conditions: {
        required: true,
        type: 'object'
      }
    }
  };

  var err = shareseye.jsonSchema.validate(_schema, offerObj);
  if (err.length) throw new Error(JSON.stringify(err));

  _schema = {
    properties: {
      min_order: {
        properties: {
          required: true,
          type: 'integer'
        }
      },
      upto: {
        properties: {
          required: true,
          type: 'float'
        }
      },
      upto_on_item_or_bill: {
        properties: {
          required: true,
          type: 'integer',
          minimum: 0,
          maximum: 1
        }
      }
    }
  };
  const conditionObjSchema = {
    required: true,
    type: 'array',
    itemstype: 'object',
    properties: {
      set_index: {
        required: true,
        type: 'integer',
        minimum: 0
      },
      ids: {
        required: true,
        type: 'array',
        itemstype: 'object',
        properties: {
          group: {
            required: true,
            type: 'string',
            values: ['cid', 'pid', 'sid', 'alid', 'aid']
          },
          id: {
            required: true,
            type: 'integer',
            minimum: 1
          },
          type: {
            required: true,
            type: 'integer',
            minimum: -1,
            maximum: 2
          }
        }
      },
      qty: {
        required: true,
        type: 'float',
        minimum: 0.01
      }
    }
  };

  if (offerObj.offer_type == 1) {
    _schema.properties.overall = conditionObjSchema;

    err = shareseye.jsonSchema.validate(_schema, offerObj.conditions);
    if (err.length) throw new Error(JSON.stringify(err));
  } else if (offerObj.offer_type == 2) {
    _schema.properties.buy = conditionObjSchema;
    _schema.properties.get = {
      required: true
    };

    err = shareseye.jsonSchema.validate(_schema, offerObj.conditions);
    if (err.length) throw new Error(JSON.stringify(err));

    if (typeof offerObj.conditions.get == 'object') {
      _schema = {
        properties: {
          get: conditionObjSchema
        }
      };
    } else {
      _schema = {
        properties: {
          get: {
            required: true,
            type: 'integer',
            minimum: 1
          }
        }
      };
    }

    const o = {
      get: offerObj.conditions.get
    };
    err = shareseye.jsonSchema.validate(_schema, o);
    if (err.length) throw new Error(JSON.stringify(err));
  }

  // convert conditions array to conditions array of array
  const convertFun = (arr) => {
    return arr.reduce((preVal, curVal) => {
      if (preVal[curVal.set_index] === undefined) {
        preVal[curVal.set_index] = [];
      }
      preVal[curVal.set_index].push({
        ids: curVal.ids,
        qty: curVal.qty
      });
      return preVal;
    }, []);
  };

  offerObj = _.cloneDeep(offerObj);

  // call convert function
  Object.entries(offerObj.conditions).forEach(([key, value]) => {
    if (typeof value === 'object' && value instanceof Array) {
      offerObj.conditions[key] = convertFun(offerObj.conditions[key]);
    }
  });

  this._offers.push(offerObj);

  // init offers
  this._initOffers();
};

/**
 * @prototype
 * @desc this function is used to remove offer on cart.
 * @param {number} oid offer id.
 */
Cart.prototype.removeOffer = function(oid) {
  const _schema = {
    properties: {
      oid: {
        required: true,
        type: 'integer'
      }
    }
  };

  const o = {
    oid: oid
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const index = this._offers.findIndex(eachofferObj => eachofferObj.oid == oid);
  if (index != -1) {
    this._offers.splice(index, 1);
  }
};

/**
 * @prototype
 * @desc this function is used to init offers.
 */
Cart.prototype._initOffers = function() {
  const that = this;

  // convert items object to items array
  const items = (items => {
    return Object.entries(items).map(([order_id, each_order_data]) => {
      return Object.entries(each_order_data).map(([item_id, each_item_data]) => {
        return {
          order_id: order_id,
          item_id: item_id,
          cid: each_item_data.cid,
          pid: each_item_data.pid,
          type: each_item_data.type,
          qty: each_item_data.qty,
          sid: each_item_data.sid,
          addon_labels: each_item_data.addon_labels.map(each => {
            return {
              alid: each.alid,
              addons: each.addons.map(each => each.aid)
            };
          }),
          item_cost: each_item_data.item_cost
        };
      });
    }).flat(1).sort((a, b) => a.item_cost / a.qty == b.item_cost / b.qty ? 0 : a.item_cost / a.qty > b.item_cost / b.qty ? 1 : -1);
  })(this._items);

  // remove all offers applied on items
  items.forEach(each => {
    that._items[each.order_id][each.item_id].offers.tags = [];

    that._items[each.order_id][each.item_id].offers.automatic.oid = null;
    that._items[each.order_id][each.item_id].offers.automatic.oqty = null;

    that._items[each.order_id][each.item_id].offers.coupon.oid = null;
    that._items[each.order_id][each.item_id].offers.coupon.oqty = null;
  });

  /**
   * @prototype
   * @desc this function is used to check each condition.
   * @param {Object} eachConditionSetObj object having single condition.
   * @param {Array} eachConditionSetObj.ids array of conditions.
   * @param {string} eachConditionSetObj.ids[].group it will be either cid | pid | sid | alid | aid.
   * @param {number} eachConditionSetObj.ids[].id id of group.
   * @param {number} eachConditionSetObj.ids[].type item type - any(-1) | eggetarian(0) | vegetarian(1) | non-vegetarian(2).
   * @param {string} eachConditionSetObj.qty qty of item.
   * @param {Set} extraKeys extra properties for matched_items.
   * @returns {Object}
   */
  const checkCondition = (eachConditionSetObj, extraKeys) => {
    const res = {
      factor: null,
      matched_items: [],
      total_item_cost: 0
    };

    // get filtered items
    const filtered_items = eachConditionSetObj.ids.map(eachConditionObj => {
      return items
        // filter by group and id
        .filter(each => {
          var bool;
          switch (eachConditionObj.group) {
            case 'cid':
            case 'pid':
            case 'sid':
              bool = each[eachConditionObj.group] == eachConditionObj.id;
              break;
            case 'alid':
              bool = each.addon_labels.some(each => each.alid == eachConditionObj.alid);
              break;
            case 'aid':
              bool = each.addon_labels.map(each => each.addons).flat(1).some(each => each.aid == eachConditionObj.aid);
              break;
          }
          return bool;
        })
        // filter by type
        .filter(each => {

          // any(-1)
          if (eachConditionObj.type == -1) {
            return true;
          }

          // eggetarian(0)
          if (eachConditionObj.type == 0) {
            return each.type == 0;
          }

          // vegetarian(1)
          if (eachConditionObj.type == 1) {
            return each.type == 1 || each.type == 3 || each.type == 5;
          }

          // non-vegetarian(2)
          if (eachConditionObj.type == 2) {
            return each.type == 2 || each.type == 4 || each.type == 6;
          }
        });
    }).flat(1);

    // calc factor
    res.factor = Math.trunc(filtered_items.reduce((preVal, curVal) => preVal + curVal.qty, 0) / eachConditionSetObj.qty);

    if (res.factor) {

      // push to matched_items
      res.matched_items = filtered_items.map(each => {

        // object data for push
        const pushObj = {};

        // loop extra keys and push data to object
        extraKeys.forEach(extraKey => pushObj[extraKey] = each[extraKey]);

        return pushObj;
      });

      // calc total_item_cost for eachConditionSetObj qty
      var qty = eachConditionSetObj.qty;
      filtered_items.forEach(each => {

        // if qty is zero
        if (!qty) {
          return;
        }

        if (each.qty >= qty) {
          res.total_item_cost += (each.item_cost / each.qty) * qty;
          qty = 0;
        } else {
          res.total_item_cost += each.item_cost;
          qty -= each.qty;
        }
      });
    }

    return res;
  };

  /**
   * @prototype
   * @desc this function is used to check conditions if they satisfy or not with factor value.
   * @param {Array} conditionsArr conditions array check offerObj.conditions.
   * @param {Array} extraKeys extra properties for matched_items.
   * @returns {Object}
   */
  const checkConditions = (conditionsArr, extraKeys = []) => {

    // extra keys
    extraKeys.push('order_id', 'item_id', 'qty');
    extraKeys = new Set(extraKeys);

    // return data
    const resArr = {
      factor: null,
      all_matched_items: []
    };

    // loop conditionsArr
    conditionsArr.forEach(subConditionsArr => {
      const resSubArr = {
        factor: 0,
        matched_items: [],
        total_item_cost: Number.POSITIVE_INFINITY,
        offer_qty: 0
      };

      // loop eachCondition
      subConditionsArr.forEach(eachConditionSetObj => {
        const res = checkCondition(eachConditionSetObj, extraKeys);
        if (res.factor && res.total_item_cost < resSubArr.total_item_cost) {
          resSubArr.factor = res.factor;
          resSubArr.matched_items = res.matched_items;
          resSubArr.total_item_cost = res.total_item_cost;
          resSubArr.offer_qty = eachConditionSetObj.qty;
        }
      });

      // push to resArr
      resArr.all_matched_items.push({
        _factor: resSubArr.factor,
        matched_items: resSubArr.matched_items,
        offer_qty: resSubArr.offer_qty
      });
    });

    // calc min factor
    resArr.factor = resArr.all_matched_items.map(each => each._factor).reduce((preVal, curVal) => preVal < curVal ? preVal : curVal, Number.POSITIVE_INFINITY);

    return resArr;
  };

  /**
   * @prototype
   * @desc this function is used to apply offers to items with factor.
   * @param {number} oid offer id.
   * @param {number} coupon if empty then it is applied automatically else offer will be applied with only coupon.
   * @param {number} factor the number of times offer can apply.
   * @param {Array} matched_items array of matched items.
   * @param {number} offer_qty qty given in offer.
   * @param {Array} tag_names offer tag name array of strings.
   */
  const applyOffertoItems = (oid, coupon, factor, matched_items, offer_qty, tag_names) => {
    var qty = factor * offer_qty;

    matched_items.forEach(each_item_data => {

      // if qty is zero
      if (!qty) {
        return;
      }

      tag_names.forEach(tag_name => {
        const tag = (coupon.length ? 'coupon-' : '') + tag_name;
        that._items[each_item_data.order_id][each_item_data.item_id].offers.tags.push(tag);
      });

      if (!tag_names.includes('buy')) {
        that._items[each_item_data.order_id][each_item_data.item_id].offers[coupon.length ? 'coupon' : 'automatic'].oid = oid;
        that._items[each_item_data.order_id][each_item_data.item_id].offers[coupon.length ? 'coupon' : 'automatic'].oqty = each_item_data.qty >= qty ? qty : each_item_data.qty;
      }

      qty = each_item_data.qty >= qty ? 0 : qty - each_item_data.qty;
    });
  };

  // loop offers
  this._offers
    // clear all error messages
    .filter(offerObj => {
      offerObj.err = null;
      return true;
    })
    // visits
    .filter(offerObj => {
      const bool = {
        min: true,
        max: true
      };

      // calc total visits of matched menu code
      const total_visits_count = Object.entries(that._notes.visits).reduce((preVal, [menu_code, count]) => {
        if (offerObj.filters.menu_code.list.includes(menu_code)) {
          preVal += count;
        }
        return preVal;
      }, 0);

      // min visits
      if (offerObj.filters.menu_code.visits.min != -1) {
        if (total_visits_count < offerObj.filters.menu_code.visits.min) {
          offerObj.err = 'menu_code.visits.min';
          bool.min = false;
        }
      }

      // max visits
      if (offerObj.filters.menu_code.visits.max != -1) {
        if (total_visits_count > offerObj.filters.menu_code.visits.max) {
          offerObj.err = 'menu_code.visits.max';
          bool.max = false;
        }
      }

      return bool.min && bool.max;
    })
    // phsid
    .filter(offerObj => {
      const bool = !offerObj.filters.phone.length || offerObj.filters.phone.includes(that._notes.phone_number);
      if (!bool) offerObj.err = 'phone';
      return bool;
    })
    // platform
    .filter(offerObj => {
      var platform = null;
      if (new RegExp(/^[A-Z]{1}M(|TA|HD)[0-9]{1,}$/).test(that._table.id)) { // manual
        platform = 1;
      } else if (new RegExp(/^[A-Z]{1}K(|TA|HD|RO)[0-9]{1,}$/).test(that._table.id)) { // digital
        platform = 2;
      } else if (new RegExp(/^[A-Z]{1}A(TA|HD)[0-9]{1,}$/).test(that._table.id)) { // app
        platform = 3;
      } else if (new RegExp(/^[A-Z]{1}W(TA|HD)[0-9]{1,}$/).test(that._table.id)) { // website
        platform = 4;
      }
      const bool = !offerObj.filters.platform.length || offerObj.filters.platform.includes(platform);
      if (!bool) offerObj.err = 'platform';
      return bool;
    })
    // order_type
    .filter(offerObj => {
      var order_type = null;
      if (new RegExp(/^[A-Z]{1}(M|K|A)[0-9]{1,}$/).test(that._table.id)) { // dine
        order_type = 1;
      } else if (new RegExp(/^[A-Z]{1}(M|K|A|W)TA[0-9]{1,}$/).test(that._table.id)) { // take_away
        order_type = 2;
      } else if (new RegExp(/^[A-Z]{1}(M|K|A|W)HD[0-9]{1,}$/).test(that._table.id)) { // home_delivery
        order_type = 3;
      } else if (new RegExp(/^[A-Z]{1}KRO[0-9]{1,}$/).test(that._table.id)) { // room
        order_type = 4;
      }
      const bool = !offerObj.filters.order_type.length || offerObj.filters.order_type.includes(order_type);
      if (!bool) offerObj.err = 'order_type';
      return bool;
    })
    // start date
    .filter(offerObj => {
      const bool = that._notes.date_time.toJsDate().getTime() >= (offerObj.filters.start_date + '.00:00:00').toJsDate().toTimezone(offerObj.filters.timezoneoffset).getTime();
      if (!bool) offerObj.err = 'start_date';
      return bool;
    })
    // end date
    .filter(offerObj => {
      const bool = that._notes.date_time.toJsDate().getTime() <= (offerObj.filters.end_date + '.23:59:59').toJsDate().toTimezone(offerObj.filters.timezoneoffset).getTime();
      if (!bool) offerObj.err = 'end_date';
      return bool;
    })
    // start time
    .filter(offerObj => {
      const d = that._notes.date_time.toJsDate();
      const bool = d.getTime() >= (
        ('0' + d.getDate()).slice(-2) + '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
        d.getFullYear() + '.' + offerObj.filters.start_time
      ).toJsDate().toTimezone(offerObj.filters.timezoneoffset).getTime();
      if (!bool) offerObj.err = 'start_time';
      return bool;
    })
    // end time
    .filter(offerObj => {
      const d = that._notes.date_time.toJsDate();
      const bool = d.getTime() <= (
        ('0' + d.getDate()).slice(-2) + '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
        d.getFullYear() + '.' + offerObj.filters.end_time
      ).toJsDate().toTimezone(offerObj.filters.timezoneoffset).getTime();
      if (!bool) offerObj.err = 'end_time';
      return bool;
    })
    // days
    .filter(offerObj => {
      const bool = !offerObj.filters.days.length || offerObj.filters.days.includes(that._notes.date_time.toJsDate().getDay() + 1);
      if (!bool) offerObj.err = 'days';
      return bool;
    })
    // minimum order check
    .filter(offerObj => {
      const render_data = that.getRenderData('cart', false);
      const bool = render_data.calc.total.grand >= offerObj.conditions.min_order;
      if (!bool) offerObj.err = 'min_order';
      return bool;
    })
    // apply offers
    .forEach(offerObj => {
      if (offerObj.offer_type == 1) { // overall offer type
        const res_overall = checkConditions(offerObj.conditions.overall);
        if (res_overall.factor) {
          res_overall.all_matched_items.forEach(each => {
            applyOffertoItems(offerObj.oid, offerObj.coupon, res_overall.factor, each.matched_items, each.offer_qty, ['overall']);
          });
        }
      } else if (offerObj.offer_type == 2) { // buyx_gety offer type
        const res_buy = checkConditions(offerObj.conditions.buy, ['item_cost']);
        if (res_buy.factor) {
          if (typeof offerObj.conditions.get == 'object') {
            const res_get = checkConditions(offerObj.conditions.get);
            if (res_get.factor) {
              res_buy.all_matched_items.forEach(each => {
                applyOffertoItems(offerObj.oid, offerObj.coupon, res_buy.factor, each.matched_items, each.offer_qty, ['buy']);
              });

              res_get.all_matched_items.forEach(each => {
                const tags = ['get'];
                if (offerObj.discount.value == 100) tags.push('free');
                applyOffertoItems(offerObj.oid, offerObj.coupon, res_get.factor, each.matched_items, each.offer_qty, tags);
              });
            }

            // automatic get selection
            if (offerObj.discount.value == 100 && res_buy.factor > res_get.factor) {
              offerObj.automatic = offerObj.conditions.get;
            }
          } else {
            res_buy.all_matched_items.forEach(each => {
              applyOffertoItems(offerObj.oid, offerObj.coupon, res_buy.factor, each.matched_items, each.offer_qty, ['buy']);
            });

            const all_matched_items = res_buy.all_matched_items.map(each => each.matched_items).flat(1).sort((a, b) => a.item_cost / a.qty == b.item_cost / b.qty ? 0 : a.item_cost / a.qty > b.item_cost / b.qty ? 1 : -1);

            const tags = ['get'];
            if (offerObj.discount.value == 100) tags.push('free');
            applyOffertoItems(offerObj.oid, offerObj.coupon, res_buy.factor, all_matched_items, offerObj.conditions.get, tags);
          }
        }
      }
    });
};

/**
 * @prototype
 * @desc this function is used to find duplicate item.
 * @param {string} exception_item_id item id which should not be consider for duplicate checking.
 * @returns {Object} it will return isDuplicate and item_id properties.
 */
Cart.prototype._isItemDuplicate = function(exception_item_id, item_data) {
  const res = {
    isDuplicate: false,
    item_id: null
  };
  const isAddonsSame = (addon_labels1, addon_labels2) => {
    const allAddons1 = addon_labels1.reduce((preVal, each_addon_label_data) => {
      const addons_merged_data = each_addon_label_data.addons.reduce((preVal, each_addon_data) => {
        preVal.push({
          aid: each_addon_data.aid,
          aprice: each_addon_data.aprice,
        });
        return preVal;
      }, []);
      return [...preVal, ...addons_merged_data];
    }, []).sort((a, b) => a.aid > b.aid ? 1 : -1);

    const allAddons2 = addon_labels2.reduce((preVal, each_addon_label_data) => {
      const addons_merged_data = each_addon_label_data.addons.reduce((preVal, each_addon_data) => {
        preVal.push({
          aid: each_addon_data.aid,
          aprice: each_addon_data.aprice,
        });
        return preVal;
      }, []);
      return [...preVal, ...addons_merged_data];
    }, []).sort((a, b) => a.aid > b.aid ? 1 : -1);

    return allAddons1.length == allAddons2.length && allAddons1.every((each_addon_data, index) => each_addon_data.aid == allAddons2[index].aid && each_addon_data.aprize == allAddons2[index].aprize);
  };

  Object.values(this._items).forEach(each_order_items => {
    Object.entries(each_order_items).forEach(([each_item_id, each_item_data]) => {
      if (each_item_id != exception_item_id &&
        each_item_data.pid == item_data.pid && each_item_data.tax.tax_1 == item_data.tax.tax_1 && each_item_data.tax.tax_2 == item_data.tax.tax_2 && each_item_data.tax.tax_3 == item_data.tax.tax_3 &&
        each_item_data.sid == item_data.sid && each_item_data.sprice == item_data.sprice && isAddonsSame(each_item_data.addon_labels, item_data.addon_labels)
      ) {
        res.isDuplicate = true;
        res.item_id = each_item_id;
      }
    });
  });
  return res;
};

/**
 * @prototype
 * @desc this function is used to add item to cart.
 * @param {string} type_of_cart it should be either cart or bill.
 * @param {number} order_id order id.
 * @param {string} item_id item id.
 * @param {number} data.cid category id.
 * @param {string} data.cname category name.
 * @param {number} data.pid product id.
 * @param {string} data.pname product name.
 * @param {number} data.type product type.
 * @param {number} data.qty quantity.
 * @param {string} data.hsn_sac HSN/SAC.
 * @param {Object} data.tax tax details.
 * @param {number} data.tax.tax_1 tax_1.
 * @param {number} data.tax.tax_2 tax_2.
 * @param {number} data.tax.tax_3 tax_3.
 * @param {number} data.sid size id.
 * @param {string} data.sname size name.
 * @param {number} data.sprice size price.
 * @param {number} data.packing_charge packing charge for each item.
 * @param {boolean} data.is_addons_exist is addon for this product exist or not.
 * @param {Object} data.addon_labels addon label object.
 * @param {number} data.addon_labels.alid addon label id.
 * @param {string} data.addon_labels.alname addon label name.
 * @param {Array} data.addon_labels.addons addon array for label.
 * @param {number} data.addon_labels.addons.aid - addon id.
 * @param {string} data.addon_labels.addons.aname - addon name.
 * @param {number} data.addon_labels.addons.atype - addon type veg og non-veg.
 * @param {number} data.addon_labels.addons.aprice - addon aprice.
 * @param {number} data.instructions instructions for making.
 * @returns {string} it will item_id.
 */
Cart.prototype.addItem = function(type_of_cart, order_id, item_id, data) {
  const _schema = {
    properties: {
      type_of_cart: {
        required: true,
        type: 'string',
        values: ['cart', 'bill']
      },
      order_id: {
        required: true,
        type: 'integer'
      },
      item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      },
      cid: {
        required: true,
        type: 'integer'
      },
      cname: {
        required: true,
        type: 'string'
      },
      pid: {
        required: true,
        type: 'integer'
      },
      pname: {
        required: true,
        type: 'string'
      },
      type: {
        required: true,
        type: 'integer',
        minimum: 0,
        maximum: 7
      },
      qty: {
        required: true,
        type: 'float'
      },
      hsn_sac: {
        required: true,
        type: 'string'
      },
      tax: {
        required: true,
        type: 'object',
        properties: {
          tax_1: {
            required: true,
            type: 'float'
          },
          tax_2: {
            required: true,
            type: 'float'
          },
          tax_3: {
            required: true,
            type: 'float'
          }
        }
      },
      sid: {
        required: true,
        type: 'integer'
      },
      sname: {
        required: true,
        type: 'string'
      },
      sprice: {
        required: true,
        type: 'float'
      },
      packing_charge: {
        required: true,
        type: 'integer',
        minimum: 0,
        maximum: 255
      },
      is_addons_exist: {
        required: true,
        type: 'boolean'
      },
      addon_labels: {
        required: true,
        type: 'array',
        itemstype: 'object',
        properties: {
          alid: {
            required: true,
            type: 'integer'
          },
          alname: {
            required: true,
            type: 'string'
          },
          addons: {
            required: true,
            type: 'array',
            itemstype: 'object',
            properties: {
              aid: {
                required: true,
                type: 'integer'
              },
              aname: {
                required: true,
                type: 'string'
              },
              atype: {
                required: true,
                type: 'integer',
              },
              aprice: {
                required: true,
                type: 'float'
              }
            }
          }
        }
      },
      instructions: {
        required: true,
        type: 'string'
      }
    }
  };

  const o = {
    ...{
      type_of_cart: type_of_cart,
      order_id: order_id,
      item_id: item_id
    },
    ...data
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  var res = null;
  if (type_of_cart == 'cart') {
    res = this._isItemDuplicate(null, data);
  }
  if (res && res.isDuplicate) {
    this.updateItemQty(res.item_id, 'plus', data.qty);
    item_id = res.item_id;
  } else {
    if (!this._items[order_id]) {
      this._items[order_id] = {};
    }

    data = _.cloneDeep(data);

    // add tax properties
    data.tax.taxable_amount = null;
    data.tax.tax_1_value = null;
    data.tax.tax_2_value = null;
    data.tax.tax_3_value = null;

    // add item to object
    this._items[order_id][item_id] = {
      ...data,
      ...{
        additional_cost: null,
        addon_cost: null,
        item_cost: null
      },
      ...{
        offers: {
          tags: [],
          automatic: {
            oid: null,
            oqty: null,
            oval: 0
          },
          coupon: {
            oid: null,
            oqty: null,
            oval: 0
          }
        }
      }
    };
    this._calcItemCosts(order_id, item_id);
  }

  // init offers
  this._initOffers();

  return item_id;
};

/**
 * @prototype
 * @desc this function is used to calculate.
 * @param {number} order_id order id.
 * @param {string} item_id item id.
 */
Cart.prototype._calcItemCosts = function(order_id, item_id) {
  const _schema = {
    properties: {
      order_id: {
        required: true,
        type: 'integer'
      },
      item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      }
    }
  };

  const o = {
    order_id: order_id,
    item_id: item_id
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const item_data = this._items[order_id][item_id];

  // calc additional_cost
  const additional_cost = this._additional_charge.type == 1 ? this._additional_charge.value : item_data.sprice * this._additional_charge.value / 100;

  // calc addon cost
  const addon_cost = item_data.addon_labels.reduce((preVal, curVal) => preVal + curVal.addons.reduce((preVal, curVal) => preVal + curVal.aprice, 0), 0);

  // calc item_cost
  var item_cost = item_data.qty * (item_data.sprice + addon_cost + additional_cost);

  // if inclusive - remove tax amount in item_cost
  if (!this._tax.type) {
    item_cost = (100 * item_cost) / (100 + item_data.tax.tax_1 + item_data.tax.tax_2 + item_data.tax.tax_3);
  }

  // reflect values in item's cart object
  this._items[order_id][item_id].additional_cost = additional_cost;
  this._items[order_id][item_id].addon_cost = addon_cost;
  this._items[order_id][item_id].item_cost = item_cost;
};

/**
 * @prototype
 * @desc this function is used to get order id for item id.
 * @param {string} arg_item_id item id.
 * @returns {integer} order_id.
 */
Cart.prototype._getOrderId = function(arg_item_id) {
  const _schema = {
    properties: {
      arg_item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      }
    }
  };

  const o = {
    arg_item_id: arg_item_id
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  var returned_order_id = null;

  for (let [order_id, each_order_data] of Object.entries(this._items)) {
    for (let item_id of Object.keys(each_order_data)) {
      if (item_id == arg_item_id) {
        returned_order_id = order_id;
        break;
      }
    }
    if (returned_order_id) break;
  }

  if (returned_order_id == null) throw new Error('item_id does not exist in this cart');
  return returned_order_id.toNumber();
};

/**
 * @prototype
 * @desc this function is used to get item data for item_id.
 * @param {string} item_id item id.
 * @returns {Object} addon_data.
 */
Cart.prototype.getItem = function(item_id) {
  const _schema = {
    properties: {
      item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      }
    }
  };

  const o = {
    item_id: item_id
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const order_id = this._getOrderId(item_id);

  const item_data = {
    ...this._items[order_id][item_id]
  };

  const returnData = {
    cid: item_data.cid,
    pid: item_data.pid,
    pname: item_data.pname,
    type: item_data.type,
    sid: item_data.sid,
    qty: item_data.qty,
    aid: item_data.addon_labels.map(addon_label => addon_label.addons.map(addon => addon.aid)).flat(1),
    instructions: this._items[order_id][item_id].instructions
  };

  return returnData;
};

/**
 * @prototype
 * @desc this function is used to get all items of order_id.
 * @param {number} order_id order id of items.
 * @returns {Object} it will return item object of order id.
 */
Cart.prototype.getItems = function(order_id = -1) {
  const _schema = {
    properties: {
      order_id: {
        required: true,
        type: 'integer'
      }
    }
  };

  const o = {
    order_id: order_id
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  if (this._items.hasOwnProperty(order_id)) {
    return this._items[order_id];
  } else {
    const that = this;
    return Object.keys(this._items).reduce((preVal, order_id) => {
      return {
        ...preVal,
        ...that._items[order_id]
      };
    }, {});
  }
};

/**
 * @prototype
 * @desc this function is used to update item qty.
 * @param {string} item_id item id.
 * @param {string} operation either plus or minus.
 * @param {number} qty how much qty has to change.
 */
Cart.prototype.updateItemQty = function(item_id, operation, qty) {
  const _schema = {
    properties: {
      item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      },
      operation: {
        required: true,
        type: 'string',
        values: ['plus', 'minus']
      },
      qty: {
        required: true,
        type: 'float'
      }
    }
  };

  const o = {
    item_id: item_id,
    operation: operation,
    qty: qty
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const order_id = this._getOrderId(item_id);
  const updated_qty = +(this._items[order_id][item_id].qty + (operation == 'plus' ? 1 : -1) * qty).toFixed(2);

  if (updated_qty > 0) {
    this._items[order_id][item_id].qty = updated_qty;
    this._calcItemCosts(order_id, item_id);
  } else { // if qty is less than or equal to zero

    // delete item
    this._items[order_id][item_id] = null;
    delete this._items[order_id][item_id];

    // if order_id data does not have items then delete order
    if (!Object.keys(this._items[order_id]).length) {
      this._items[order_id] = null;
      delete this._items[order_id];
    }
  }

  // init offers
  this._initOffers();
};

/**
 * @prototype
 * @desc this function is used to update item size.
 * @param {string} item_id item id.
 * @param {Object} size size object.
 * @param {number} size.sid size id.
 * @param {string} size.sname size name.
 * @param {number} size.sprice size price.
 */
Cart.prototype.updateItemSize = function(item_id, size) {
  const _schema = {
    properties: {
      sid: {
        required: true,
        type: 'integer'
      },
      sname: {
        required: true,
        type: 'string'
      },
      sprice: {
        required: true,
        type: 'float'
      },
    }
  };

  const err = shareseye.jsonSchema.validate(_schema, size);
  if (err.length) throw new Error(JSON.stringify(err));

  const order_id = this._getOrderId(item_id);
  this._items[order_id][item_id] = {
    ...this._items[order_id][item_id],
    ...size
  };
  this._calcItemCosts(order_id, item_id);

  // init offers
  this._initOffers();
};

/**
 * @prototype
 * @desc this function is used to update addons.
 * @param {string} item_id item id.
 * @param {Object} addon_labels addon label object.
 * @param {number} addon_labels.alid addon label id.
 * @param {string} addon_labels.alname addon label name.
 * @param {Array} addon_labels.addons addon array for label.
 * @param {number} addon_labels.addons.aid - addon id.
 * @param {string} addon_labels.addons.aname - addon name.
 * @param {number} addon_labels.addons.atype - addon type veg og non-veg.
 * @param {number} addon_labels.addons.aprice - addon aprice.
 * @returns {string} item_id.
 */
Cart.prototype.updateItemAddons = function(item_id, addon_labels) {
  const _schema = {
    properties: {
      item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      },
      addon_labels: {
        required: true,
        type: 'array',
        itemstype: 'object',
        properties: {
          alid: {
            required: true,
            type: 'integer'
          },
          alname: {
            required: true,
            type: 'string'
          },
          addons: {
            required: true,
            type: 'array',
            itemstype: 'object',
            properties: {
              aid: {
                required: true,
                type: 'integer'
              },
              aname: {
                required: true,
                type: 'string'
              },
              atype: {
                required: true,
                type: 'integer',
              },
              aprice: {
                required: true,
                type: 'float'
              }
            }
          }
        }
      }
    }
  };

  const o = {
    item_id: item_id,
    addon_labels: addon_labels
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const order_id = this._getOrderId(item_id);
  const data = {
    pid: this._items[order_id][item_id].pid,
    tax: this._items[order_id][item_id].tax,
    sid: this._items[order_id][item_id].sid,
    sprice: this._items[order_id][item_id].sprice,
    addon_labels: addon_labels
  };
  const res = this._isItemDuplicate(item_id, data);
  if (res.isDuplicate) {
    this.updateItemQty(res.item_id, 'plus', this._items[order_id][item_id].qty);

    this._items[order_id][item_id] = null;
    delete this._items[order_id][item_id];

    item_id = res.item_id;
  } else {
    this._items[order_id][item_id].addon_labels = _.cloneDeep(addon_labels);
    this._calcItemCosts(order_id, item_id);
  }

  // init offers
  this._initOffers();

  return item_id;
};

/**
 * @prototype
 * @desc this function is used to update item instructions.
 * @param {string} item_id item id.
 * @param {string} instructions item instructions.
 */
Cart.prototype.updateInstructions = function(item_id, instructions) {
  const _schema = {
    properties: {
      item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      },
      instructions: {
        required: true,
        type: 'string',
        minlength: 3,
        maxlength: 500
      }
    }
  };

  const o = {
    item_id: item_id,
    instructions: instructions
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const order_id = this._getOrderId(item_id);
  this._items[order_id][item_id].instructions = instructions;
};

/**
 * @prototype
 * @desc this function is used to delete item from cart.
 * @param {string} type_of_cart it should be either cart or bill.
 * @param {string} item_id item id to be deleted.
 */
Cart.prototype.removeItem = function(type_of_cart, item_id) {
  const _schema = {
    properties: {
      type_of_cart: {
        required: true,
        type: 'string',
        values: ['cart', 'bill']
      },
      item_id: {
        required: true,
        type: 'string',
        maxlength: 36
      }
    }
  };

  const o = {
    type_of_cart: type_of_cart,
    item_id: item_id
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const order_id = this._getOrderId(item_id);
  this._items[order_id][item_id] = null;
  delete this._items[order_id][item_id];
  if (!Object.entries(this._items[order_id]).length) {
    this._items[order_id] = null;
    delete this._items[order_id];
  }

  // remove free item if discount removed
  const item_id_having_free_tag = Object.entries(this._items).map(([order_id, each_order_data]) => {
    return Object.entries(each_order_data).reduce((preVal, [item_id, each_item_data]) => {
      if (each_item_data.offers.tags.includes('free')) {
        preVal.push({
          order_id: order_id,
          item_id: item_id,
          qty: each_item_data.qty
        });
      }
      return preVal;
    }, []);
  }).flat(1);

  // init offers
  this._initOffers();

  if (type_of_cart == 'cart') {
    const that = this;
    item_id_having_free_tag.forEach(each => {
      if (!that._items[each.order_id][each.item_id].offers.tags.includes('free')) {
        that.updateItemQty(item_id, 'minus', each.qty);
      }
    });
  }
};

/**
 * @prototype
 * @desc this function is used to delete all items.
 */
Cart.prototype.removeAllItems = function() {
  this._items = {};
};

/**
 * @prototype
 * @desc this function is used to find is cart empty inorder to delete object.
 * @returns {boolean} either true or false.
 */
Cart.prototype.isCartEmpty = function() {
  return Object.keys(this._items).length ? false : true;
};

/**
 * @prototype
 * @desc this function is used to get details to be displayed with calculation.
 * @param {string} type_of_cart it should be either cart or bill.
 * @param {boolean} is_calc_discount - whether to calc discount or not when getting old bills we shouldn't add old offer object and calc discount, instead of this directly change oval for item data.
 * @param {integer} toFixed - upto number of decimals to be fixed.
 * @returns {Object} render_data.
 */
Cart.prototype.getRenderData = function(type_of_cart, is_calc_discount = true, toFixed = 0) {
  const _schema = {
    properties: {
      type_of_cart: {
        required: true,
        type: 'string',
        values: ['cart', 'bill']
      },
      is_calc_discount: {
        required: true,
        type: 'boolean'
      }
    }
  };

  const o = {
    type_of_cart: type_of_cart,
    is_calc_discount: is_calc_discount
  };
  const err = shareseye.jsonSchema.validate(_schema, o);
  if (err.length) throw new Error(JSON.stringify(err));

  const that = this;

  // output object
  const render_data = {
    calc: {
      total: {
        sub: {}, // sub total will have order wise total
        grand: 0, // sum of sub total of all orders
        round_off: 0, // round off decimal value
        final: 0 // bill value
      },
      offer: {
        automatic: 0, // value
        coupon: 0 // value
      },
      service_charge: 0, // value
      tax: {
        tax_1: 0, // value
        tax_2: 0, // value
        tax_3: 0 // value
      },
      extra_charge: {
        delivery_charge: 0, // value
        delivery_charge_tax: 0, // value
        packing_charge: 0 // value
      }
    }
  };

  // calc sub total and grand total
  render_data.calc.total.grand = Object.entries(that._items).reduce((preVal, [order_id, each_order_data]) => {
    render_data.calc.total.sub[order_id] = Object.values(each_order_data).reduce((preVal, curVal) => preVal + curVal.item_cost, 0);
    return preVal + render_data.calc.total.sub[order_id];
  }, 0);

  if (is_calc_discount) {

    /**
     * @prototype
     * @desc this function is used to calculate discount.
     * @param {Object} each_item_data item data.
     * @param {Object} offerObj offer data.
     * @param {number} oqty offer qty.
     * @returns {number} discount value.
     */
    const getDiscount = (each_item_data, offerObj, oqty) => {

      // it has discount per qty
      var discount = 0;

      if (offerObj.discount.on == 1) {
        discount = (each_item_data.item_cost / each_item_data.qty) * offerObj.discount.value / 100;
      } else {
        discount = (each_item_data.sprice + each_item_data.additional_cost) * offerObj.discount.value / 100;
      }

      // calc discount for oqty
      return discount * oqty;
    };

    // for upto discount limit check when `upto_on_item_or_bill` value is 0
    const offer_discount_amount = {};

    // discount calculation
    for (let [order_id, each_order_data] of Object.entries(that._items)) {
      for (let [item_id, each_item_data] of Object.entries(each_order_data)) {

        // reset automatic and coupon discounts
        that._items[order_id][item_id].offers.automatic.oval = 0;
        that._items[order_id][item_id].offers.coupon.oval = 0;

        // get automatic-offer object
        const automaticOfferObj = this._offers.find(offerObj => offerObj.oid == each_item_data.offers.automatic.oid);

        // automatic
        if (!offer_discount_amount.hasOwnProperty(each_item_data.offers.automatic.oid)) offer_discount_amount[each_item_data.offers.automatic.oid] = 0;

        // calc automatic discount
        var automatic_discount = 0;
        if (automaticOfferObj) {
          automatic_discount = getDiscount(each_item_data, automaticOfferObj, each_item_data.offers.automatic.oqty);

          // upto limit check - bill
          if (automaticOfferObj.conditions.upto_on_item_or_bill == 0) {
            if (automaticOfferObj.conditions.upto && offer_discount_amount[each_item_data.offers.automatic.oid] + automatic_discount > automaticOfferObj.conditions.upto) {
              automatic_discount = automaticOfferObj.conditions.upto - offer_discount_amount[each_item_data.offers.automatic.oid];
            }
          } else { // item
            if (automaticOfferObj.conditions.upto && automatic_discount / each_item_data.offers.automatic.oqty > automaticOfferObj.conditions.upto) {
              automatic_discount =  automaticOfferObj.conditions.upto * each_item_data.offers.automatic.oqty;
            }
          }

          // discount amount reached item_cost check
          if (that._items[order_id][item_id].offers.automatic.oval + automatic_discount > each_item_data.item_cost) {
            automatic_discount = each_item_data.item_cost - that._items[order_id][item_id].offers.automatic.oval;
          }

          offer_discount_amount[each_item_data.offers.automatic.oid] += automatic_discount;
          that._items[order_id][item_id].offers.automatic.oval += automatic_discount;
          render_data.calc.offer.automatic += automatic_discount;
        }

        // get coupon-offer object
        const couponOfferObj = this._offers.find(offerObj => offerObj.oid == each_item_data.offers.coupon.oid);

        // coupon
        if (!offer_discount_amount.hasOwnProperty(each_item_data.offers.coupon.oid)) offer_discount_amount[each_item_data.offers.coupon.oid] = 0;

        // calc coupon discount
        var coupon_discount = 0;
        if (couponOfferObj) {
          coupon_discount = getDiscount(each_item_data, couponOfferObj, each_item_data.offers.coupon.oqty);

          // upto limit check - bill
          if (couponOfferObj.conditions.upto_on_item_or_bill == 0) {
            if (couponOfferObj.conditions.upto && offer_discount_amount[each_item_data.offers.coupon.oid] + coupon_discount > couponOfferObj.conditions.upto) {
              coupon_discount = couponOfferObj.conditions.upto - offer_discount_amount[each_item_data.offers.coupon.oid];
            }
          } else {
            if (couponOfferObj.conditions.upto && coupon_discount / each_item_data.offers.coupon.oqty > couponOfferObj.conditions.upto) {
              coupon_discount = couponOfferObj.conditions.upto * each_item_data.offers.coupon.oqty;
            }
          }

          // discount amount reached item_cost check
          if (that._items[order_id][item_id].offers.coupon.oval + coupon_discount > each_item_data.item_cost) {
            coupon_discount = each_item_data.item_cost - that._items[order_id][item_id].offers.coupon.oval;
          }

          // total discount should not exceed item_cost
          if (automatic_discount + coupon_discount > each_item_data.item_cost) {
            coupon_discount = each_item_data.item_cost - automatic_discount;
          }

          offer_discount_amount[each_item_data.offers.coupon.oid] += coupon_discount;
          that._items[order_id][item_id].offers.coupon.oval += coupon_discount;
          render_data.calc.offer.coupon += coupon_discount;
        }
      }
    }
  } else {
    for (let [, each_order_data] of Object.entries(that._items)) {
      for (let [, each_item_data] of Object.entries(each_order_data)) {
        render_data.calc.offer.automatic += each_item_data.offers.automatic.oval;
        render_data.calc.offer.coupon += each_item_data.offers.coupon.oval;
      }
    }
  }

  // service charge and tax
  for (let [order_id, each_order_data] of Object.entries(that._items)) {
    for (let [item_id, each_item_data] of Object.entries(each_order_data)) {

      // service charge
      const service_charge_each = (each_item_data.item_cost - each_item_data.offers.automatic.oval - each_item_data.offers.coupon.oval) * that._service_charge / 100;
      render_data.calc.service_charge += service_charge_each;

      // tax
      that._items[order_id][item_id].tax.taxable_amount = each_item_data.item_cost - each_item_data.offers.automatic.oval - each_item_data.offers.coupon.oval + service_charge_each;
      that._items[order_id][item_id].tax.tax_1_value = that._items[order_id][item_id].tax.taxable_amount * that._items[order_id][item_id].tax.tax_1 / 100;
      that._items[order_id][item_id].tax.tax_2_value = that._items[order_id][item_id].tax.taxable_amount * that._items[order_id][item_id].tax.tax_2 / 100;
      that._items[order_id][item_id].tax.tax_3_value = that._items[order_id][item_id].tax.taxable_amount * that._items[order_id][item_id].tax.tax_3 / 100;

      render_data.calc.tax.tax_1 += that._items[order_id][item_id].tax.tax_1_value;
      render_data.calc.tax.tax_2 += that._items[order_id][item_id].tax.tax_2_value;
      render_data.calc.tax.tax_3 += that._items[order_id][item_id].tax.tax_3_value;
    }
  }

  if (type_of_cart == 'bill') {
    render_data.calc.extra_charge.delivery_charge = that._extra_charge.delivery_charge;
    render_data.calc.extra_charge.delivery_charge_tax = that._extra_charge.delivery_charge * that._extra_charge.delivery_charge_tax_exclusive / 100;
    render_data.calc.extra_charge.packing_charge = that._extra_charge.packing_charge;

    // item packing charge
    render_data.calc.extra_charge.packing_charge += Object.values(that.getItems()).reduce((preVal, curVal) => preVal + curVal.qty * curVal.packing_charge, 0);
  }

  render_data.calc.total.final = render_data.calc.total.grand - render_data.calc.offer.automatic - render_data.calc.offer.coupon +
    render_data.calc.service_charge + render_data.calc.tax.tax_1 + render_data.calc.tax.tax_2 + render_data.calc.tax.tax_3 +
    render_data.calc.extra_charge.delivery_charge + render_data.calc.extra_charge.delivery_charge_tax + render_data.calc.extra_charge.packing_charge;
  render_data.calc.total.round_off = +render_data.calc.total.final.toFixed(toFixed) - render_data.calc.total.final;
  render_data.calc.total.final = +render_data.calc.total.final.toFixed(toFixed);

  render_data.items = _.cloneDeep(this._items);

  // if inclusive - add back tax amount in item_cost
  if (!this._tax.type) {
    for (let [order_id, each_order_data] of Object.entries(render_data.items)) {
      for (let [item_id, each_item_data] of Object.entries(each_order_data)) {
        render_data.items[order_id][item_id].item_cost = each_item_data.item_cost + each_item_data.item_cost * (each_item_data.tax.tax_1 + each_item_data.tax.tax_2 + each_item_data.tax.tax_3) / 100;
      }
    }
  }

  return render_data;
};
