'use strict';

(function () {
  var locale = {
    done: {
      ru: 'Готово',
      en: 'Done'
    },
    cancel: {
      ru: 'Отмена',
      en: 'Cancel'
    }
  };

  var _t = function (name) {
    return locale[name][moment.locale()];
  };


  // All compute* functions compute subperiods of a given period. and then used in the calendar view

  /**
   * @param {string|int} year
   * @returns {Array} quarters of this year, format: {title: '2015/Q2', range: moment.ran}
   */
  function computeQuarters (year) {
    return [1, 2, 3, 4].map(function (quarterNum) {
      var quarter = moment().year(year).quarter(quarterNum);

      return {
        title: year + '/Q' + quarterNum, // + ' ' + _t('quarter'),
        range: moment.range(quarter.clone().startOf('quarter'), quarter.clone().endOf('quarter'))
      };
    })
  }

  function computeMonths (year) {
    return moment.months().map(function (monthName, monthIndex) {
      var month = moment().year(year).month(monthIndex);

      return {
        title: month.format('MMMM'),
        isToday: month.format('YYYY-MM') === moment().format('YYYY-MM'),
        range: moment.range(month.clone().startOf('month'), month.clone().endOf('month'))
      };
    });
  }

  function computeWeeks (year, month) {
    var startDay = moment().year(year).month(month).startOf('month').startOf('week'); // period start
    var endDay = moment().year(year).month(month).endOf('month').endOf('week'); // period end

    var weeks = [];
    moment().range(startDay, endDay).by('weeks', function (week) { // iterate over period weeks
      weeks.push({
        title: week.format('w'),
        range: moment.range(week.clone().startOf('week'), week.clone().endOf('week'))
      });
    });

    return weeks;
  }

  function generateDays (year, month) {
    var startDay = moment().year(year).month(month).startOf('month').startOf('week');
    var endDay = moment().year(year).month(month).endOf('month').endOf('week');

    var days = [];
    moment().range(startDay, endDay).by('days', function (day) {
      days.push({
        title: day.format('D'),
        isCurrentMonth: day.month() === month,
        isToday: day.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'),
        range: moment.range(day.clone().startOf('day'), day.clone().endOf('day'))
      });
    });

    return days;
  }

  var rkRangeCalendar = Vue.extend({
    template: '#rk-range-calendar', // view template. should be appended to html as <script type="x-template" id="rk-range-calendar"></script> (once for all instances)
    rangeable: ['quarter', 'month'/*, 'week', 'day' */], // which controls are rangeable (allows to select a range by selecting start moment and end moment)

    props: { // properties that can be passed as options i.e. <rk-range-calendar format="MM/DD/YYYY"></rk-range-calendar>
      selectedPeriodStart: {
        default: function () {
          return moment().startOf('month');
        }
      },
      selectedPeriodEnd: {
        default: function () {
          return moment().endOf('month');
        }
      },
      format: {
        default: 'DD.MM.YYYY'
      }
    },

    data: function () { // data available in the view
      return {
        year: moment().get('year'),
        currentMonth: moment().get('month'),

        // computed (computed by 'computed' methods below. this properties computed every time they dependencies are changed)
        currentMonthTitle: '',
        quarters: [],
        months: [],
        days: [],
        weeks: [],

        // state info. what type of range is started to selecting
        rangeInfo: {
          isStarted: false,
          rangeType: null
        },

        // i18n
        lang: {
          done: _t('done'),
          cancel: _t('cancel')
        }
      };
    },

    methods: { // this methods are available from view
      setYear: function (year) {
        this.year = year;
      },

      /**
       * Set current month by index, negative and >= 12 indexes are allowed. 0 based (0 -- January)
       *
       * @param {int} month. 0 based month index
       */
      setMonth: function (month) {
        var monthsInYear = 12; // thank you, captain obvious

        if (month < 0) {
          this.year = this.year - 1;
        } else if (month >= monthsInYear) {
          this.year = this.year + 1;
        }

        this.currentMonth = ((month % monthsInYear) + monthsInYear) % monthsInYear; // positive modulus
      },

      /**
       * All methods above (select*(*)) is fired when * is clicked in the view
       *
       * @param {{range: DateRange}} day
       */
      selectDay: function (day) {
        this.setRange(day.range, 'day');
      },
      selectWeek: function (week) {
        this.setRange(week.range, 'week');
      },
      selectMonth: function (month) {
        this.setRange(month.range, 'month');
      },
      selectQuarter: function (quarter) {
        this.setRange(quarter.range, 'quarter');
      },
      selectYear: function (year) {
        var momentYear = moment(year, 'YYYY');
        this.setRange(moment.range(momentYear.clone().startOf('year'), momentYear.clone().endOf('year')), 'year');
      },

      /**
       * Update current period by range.
       *
       * @param {DateRange} range
       * @param {string} rangeType
       */
      setRange: function (range, rangeType) {
        var isAddToCurrentPeriod = this.rangeInfo.isStarted // start range exist
          && !range.start.isBefore(this.selectedPeriodEnd) // selected range is after start range type
          && (this.$options.rangeable.indexOf(rangeType) >= 0) // is rangeable
          && (rangeType === this.rangeInfo.rangeType); // start range type is the same as selected range type

        if (!isAddToCurrentPeriod) { // if this range is not an END of selected period -- set it as START
          this.selectedPeriodStart = range.start;
          this.rangeInfo.isStarted = true;
        } else { // else it is not START
          this.rangeInfo.isStarted = false;
        }
        this.selectedPeriodEnd = range.end;
        this.rangeInfo.rangeType = rangeType;

        this.currentMonth = range.end.get('month'); // update day calendar to show last month of the current period
      },

      /**
       * Check if passed range is IN selected period (used to set view control of this range as active)
       *
       * @param {DateRange} range
       * @returns {boolean}
       */
      isRangeSelected: function (range) {
        var selectedPeriod = moment.range(this.selectedPeriodStart, this.selectedPeriodEnd);
        return selectedPeriod.contains(range.start) && selectedPeriod.contains(range.end);
      },

      /**
       * Check if passed range argument is INTERSECTS selected period (used to set view control of this range as active)
       *
       * @param {DateRange} range
       * @returns {boolean}
       */
      isRangePartiallySelected: function (range) {
        var selectedPeriod = moment.range(this.selectedPeriodStart, this.selectedPeriodEnd);
        return selectedPeriod.overlaps(range);
      }
    },


    filters: {
      /**
       * Moment <-> String filters for moment object
       */
      momentStart: {
        read: function (momentDate) {
          return momentDate ? momentDate.format(this.format) : '';
        },
        write: function (dateString) {
          return dateString ? moment(dateString, this.format).startOf('day') : '';
        }
      },
      momentEnd: {
        read: function (momentDate) {
          return momentDate ? momentDate.format(this.format) : '';
        },
        write: function (dateString) {
          return dateString ? moment(dateString, this.format).endOf('day') : '';
        }
      }
    },

    /**
     * View values that depends on another values. Computes automatically every time when dependencies changed
     */
    computed: {
      quarters: function () {
        return computeQuarters(this.year);
      },

      months: function () {
        return computeMonths(this.year);
      },

      days: function () {
        return generateDays(this.year, this.currentMonth);
      },

      weeks: function () {
        return computeWeeks(this.year, this.currentMonth);
      },

      currentMonthTitle: function () {
        return moment.months('-MMMM-', this.currentMonth) + ', ' + this.year;
      }
    }
  });


  // defines <rk-range-calendar> component
  Vue.component('rk-range-calendar', rkRangeCalendar);
})();