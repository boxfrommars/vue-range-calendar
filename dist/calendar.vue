<script>
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

  module.exports = Vue.extend({
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


</script>

<template>
  <div class="panel panel-default rk-range-calendar">
    <div class="panel-heading">
      <!--Year-->
      <div class="btn-group" role="group" aria-label="...">
        <a class="btn btn-default" @click="setYear(year - 1)"><i class="fa fa-chevron-left"></i></a>
        <button type="button" class="btn btn-default" @click="selectYear(year)">{{ year }}</button>
        <a class="btn btn-default" @click="setYear(year + 1)"><i class="fa fa-chevron-right"></i></a>
      </div>
    </div>

    <div class="panel-body disable-text-select">
      <div class="row">

        <!--Quarters-->
        <div class="col-md-2">
          <ul class="nav nav-pills rk-quarters">
            <li v-for="quarter in quarters" :class="{active: isRangeSelected(quarter.range), 'partially-active': isRangePartiallySelected(quarter.range)}">
              <a @click="selectQuarter(quarter)">{{ quarter.title }}</a>
            </li>
          </ul>
        </div>

        <!--Months-->
        <div class="col-md-5">
          <ul class="nav nav-pills rk-months">
            <li v-for="month in months"
                :class="{active: isRangeSelected(month.range), 'partially-active': isRangePartiallySelected(month.range), today: month.isToday}">
              <a @click="selectMonth(month)" class="text-capitalize">{{ month.title }}</a>
            </li>
          </ul>
        </div>

        <!--Days-->
        <div class="col-md-5">
          <div class="panel panel-default rk-calendar">
            <div class="panel-heading">

              <a class="pull-left" @click="setMonth(currentMonth - 1)"><i class="fa fa-chevron-left"></i></a>
              <span class="text-capitalize">{{ currentMonthTitle }}</span>
              <a class="pull-right" @click="setMonth(currentMonth + 1)"><i class="fa fa-chevron-right"></i></a>
            </div>
            <div class="panel-body">
              <div class="row">
                <div class="col-md-2">
                  <a v-for="week in weeks" class="rk-week" @click="selectWeek(week)">
                    <i class="fa fa-circle" :class="{hidden: !isRangeSelected(week.range)}"></i>
                    <i class="fa fa-circle-o" :class="{hidden: isRangeSelected(week.range) || isRangePartiallySelected(week.range)}"></i>
                    <i class="fa fa-dot-circle-o" :class="{hidden: isRangeSelected(week.range) || !isRangePartiallySelected(week.range)}"></i>
                  </a>
                </div>
                <div class="col-md-10">
                  <div class="rk-days">
                    <a v-for="day in days"
                       @click="selectDay(day)"
                       :class="{active: isRangeSelected(day.range), 'rk-day-muted': !day.isCurrentMonth, today: day.isToday}"
                       class="rk-day">{{ day.title }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <form class="form-inline" style="text-align: center">
        <div class="form-group">
          <input type="text" class="form-control" id="periodStart" v-model="selectedPeriodStart | momentStart" />
        </div>
        <div class="form-group">
          <label for="periodEnd">&mdash;</label>
          <input type="text" class="form-control" id="periodEnd" v-model="selectedPeriodEnd | momentEnd" />
        </div>
        <button type="submit" class="btn btn-primary pull-right">{{ lang.done }}</button>
        <button type="button" class="btn btn-default pull-left">{{ lang.cancel }}</button>
      </form>
    </div>
  </div>
</template>

<style>
  .rk-range-calendar {
    border: 1px solid #ccc;
    width: 800px;
    margin: 50px auto;
  }

  .rk-range-calendar > .panel-body {
    height: 300px;
  }

  .rk-range-calendar .panel-heading {
    text-align: center;
  }

  .rk-range-calendar a {
    cursor: pointer;
  }

  .rk-range-calendar .nav-pills li a {
    border-radius: 0;
    border: 1px solid #fff;
  }

  .rk-range-calendar .nav-pills li.today a {
    border-color: orange;
  }

  .rk-range-calendar .nav-pills li.partially-active a {
    background-color: rgba(51, 122, 183, 0.18);
  }

  .rk-range-calendar .nav-pills li.active.partially-active a {
    background-color: #337ab7;
  }

  .rk-range-calendar .rk-calendar .panel-heading {
    text-align: center;
  }

  .rk-range-calendar .rk-days {
    border: 1px solid #eee;
  }

  .rk-range-calendar .rk-day {
    padding: 0 5px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #eee;
    /*border-width: 1px 1px 0 0;*/
    display: inline-block;
    width: 14%;
    text-align: center;
    box-sizing: border-box;

    text-decoration: none;
    font-size: .9em;
  }

  .rk-range-calendar .rk-week {
    height: 30px;
    line-height: 30px;
    display: inline-block;
    width: 100%;
    text-align: left;
    box-sizing: border-box;
    text-decoration: none;
    font-size: 1.2em;
  }

  .rk-range-calendar .rk-day-muted {
    background: #eee;
    color: #999;
  }

  .rk-range-calendar .rk-quarters > li + li,
  .rk-range-calendar .rk-months > li + li
  {
    margin-left: 0;
  }

  .rk-range-calendar .rk-months > li {
    width: 30%;
    text-align: center;
  }

  .rk-range-calendar .rk-day.active {
    background-color: #337ab7;
    color: #fff;
  }

  .rk-range-calendar .disable-text-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .rk-range-calendar .today {
    border-color: orange;
  }
</style>