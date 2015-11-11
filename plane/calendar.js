'use strict';

(function () {
  var locale = {
    quarter: {
      ru: 'квартал',
      en: 'quarter'
    },
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

  function generateQuarters (year) {
    return [1, 2, 3, 4].map(function (quarterNum) {
      var quarter = moment().year(year).quarter(quarterNum);

      return {
        title: year + '/Q' + quarterNum, // + ' ' + _t('quarter'),
        range: moment.range(quarter.clone().startOf('quarter'), quarter.clone().endOf('quarter'))
      };
    })
  }

  function generateMonths (year) {
    return moment.months().map(function (monthName, monthIndex) {
      var month = moment().year(year).month(monthIndex);

      return {
        title: month.format('MMMM'),
        isToday: month.format('YYYY-MM') === moment().format('YYYY-MM'),
        range: moment.range(month.clone().startOf('month'), month.clone().endOf('month'))
      };
    });
  }

  function generateWeeks (year, month) {
    var startDay = moment().year(year).month(month).startOf('month').startOf('week');
    var endDay = moment().year(year).month(month).endOf('month').endOf('week');

    var weeks = [];
    moment().range(startDay, endDay).by('weeks', function (week) {
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
    template: '#rk-range-calendar',

    rangeable: ['quarter', 'month'/*, 'week', 'day' */],

    data: function () {
      return {
        year: moment().get('year'),
        currentMonth: moment().get('month'),

        selectedPeriodStart: moment().startOf('month'),
        selectedPeriodEnd: moment().endOf('month'),

        // computed
        currentMonthTitle: '',
        quarters: [],
        months: [],
        days: [],
        weeks: [],

        // state info
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

    methods: {
      setYear: function (year) {
        this.year = year;
      },

      setMonth: function (month) {
        var monthsInYear = 12; // thank you, captain obvious

        if (month < 0) {
          this.year = this.year - 1;
        } else if (month >= monthsInYear) {
          this.year = this.year + 1;
        }

        this.currentMonth = ((month % monthsInYear) + monthsInYear) % monthsInYear; // positive modulus
      },

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

      setRange: function (range, rangeType) {
        var isAddToRange = this.rangeInfo.isStarted // start range exist
          && !range.start.isBefore(this.selectedPeriodEnd) // selected range is after start range type
          && (this.$options.rangeable.indexOf(rangeType) >= 0) // is rangeable
          && (rangeType === this.rangeInfo.rangeType); // start range type is the same as selected range type

        if (!isAddToRange) {
          this.selectedPeriodStart = range.start;
        }
        this.selectedPeriodEnd = range.end;

        this.rangeInfo.isStarted = !isAddToRange;
        this.rangeInfo.rangeType = rangeType;

        this.currentMonth = range.end.get('month');
      },

      isRangeSelected: function (range) {
        var selectedPeriod = moment.range(this.selectedPeriodStart, this.selectedPeriodEnd);
        return selectedPeriod.contains(range.start) && selectedPeriod.contains(range.end);
      },

      isRangePartiallySelected: function (range) {
        var selectedPeriod = moment.range(this.selectedPeriodStart, this.selectedPeriodEnd);
        return selectedPeriod.overlaps(range);
      }
    },

    filters: {
      momentStart: {
        read: function (momentDate) {
          return momentDate.format('DD.MM.YYYY');
        },
        write: function (dateString) {
          return moment(dateString, 'DD.MM.YYYY').startOf('day');
        }
      },
      momentEnd: {
        read: function (momentDate) {
          return momentDate.format('DD.MM.YYYY');
        },
        write: function (dateString) {
          return moment(dateString, 'DD.MM.YYYY').endOf('day');
        }
      }
    },

    computed: {
      quarters: function () {
        return generateQuarters(this.year);
      },

      months: function () {
        return generateMonths(this.year);
      },

      days: function () {
        return generateDays(this.year, this.currentMonth);
      },

      weeks: function () {
        return generateWeeks(this.year, this.currentMonth);
      },

      currentMonthTitle: function () {
        return moment.months('-MMMM-', this.currentMonth) + ', ' + this.year;
      }
    }
  });


  Vue.component('rk-range-calendar', rkRangeCalendar);
})();