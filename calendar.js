moment.locale('ru');

var locale = {
  quarter: {
    ru: 'квартал',
    en: 'quarter'
  }
};

var _t = function (name) {
  return locale[name][moment.locale()];
};

var generateQuarters = function (year) {
  return [1, 2, 3, 4].map(function (quarterNum) {
    return {
      title: year + '/Q' + quarterNum, // + ' ' + _t('quarter'),
      date: ''
    };
  })
};

var generateMonths = function (year) {
  return moment.months().map(function (monthName, monthIndex) {
    var month = moment().year(year).month(monthIndex);

    return {
      title: month.format('MM/YYYY'),
      date: month
    };
  });
};

var generateWeeks = function (year, month) {
  var startDay = moment().year(year).month(month).startOf('month').startOf('week');
  var endDay = moment().year(year).month(month).endOf('month').endOf('week');

  var weeks = [];

  moment().range(startDay, endDay).by('weeks', function (week) {
    weeks.push({
      title: week.format('w'),
      date: week
    });
  });

  return weeks;
};

var generateDays = function (year, month) {
  var startDay = moment().year(year).month(month).startOf('month').startOf('week');
  var endDay = moment().year(year).month(month).endOf('month').endOf('week');
  var days = [];

  moment().range(startDay, endDay).by('days', function (day) {
    days.push({
      title: day.format('D'),
      isCurrentMonth: day.month() === month
    });
  });

  return days;
};

new Vue({
  el: '#calendar',
  data: function () {
    return {
      year: moment().get('year'),
      currentMonth: moment().get('month'),

      // computed
      currentMonthTitle: '',
      quarters: [],
      months: [],
      days: [],
      weeks: []
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