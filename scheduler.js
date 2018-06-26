const moment = require('moment-timezone');
const _und = require('underscore');

// set the base time of when the prospect is created -- schedule today or tomorrow?
  var maxDelay = parseInt(context.query.dayMaxDelay);
  var createdAt = parseInt(context.query.startTime); // prospect creation date
  var inTime = createdAt + maxDelay;

  var eventDelta = parseInt(context.query.delta);
  var imm = createdAt + eventDelta;

  var now = moment();

  var win_open = parseInt(context.query.lowerLimit.substring(0, 2));
  var win_close = parseInt(context.query.upperLimit.substring(0, 2));
  var timeZone = context.query.timezoneID;
  // var elemType = context.query.elemType;

  var addDay = parseInt(context.query.dayOffset);
  var addHour = parseInt(context.query.hourToSend);
  var addMin = parseInt(context.query.minToSend);

  var sendWeekends = context.query.sendWeekends;

  var inTimeMoment = moment(inTime);
  var inDate = moment.tz(inTime, timeZone);
  var inDOW = inDate.isoWeekday();

  var winOpenMoment = moment.tz([inDate.year(), inDate.month(), inDate.date(), win_open], timeZone);
  var winCloseMoment = moment.tz([inDate.year(), inDate.month(), inDate.date(), win_close], timeZone);

  // console.log(inDOW);

  function schedule(addDay) {

    if (addDay === 0) { // schedule immediate events

      if (winOpenMoment.format('x') < inDate.format('x') && inDate.format('x') < winCloseMoment.format('x')) {
        sched_time = moment.tz(imm, timeZone).add({seconds:7});
        sched_time2 = sched_time.add(acctWeekend(inDOW), 'days');



        return sched_time2; // send now
      }

      else if (winOpenMoment.format('x') > inDate.format('x')) {
        sched_time = winOpenMoment.add({milliseconds:eventDelta});
        sched_time2 = sched_time.add(acctWeekend(inDOW), 'days');

        //console.log("same", sched_time, acctWeekend(inDOW), sched_time2);

        return sched_time2; // wait until the open window
      }

      else {
        sched_time = winOpenMoment.add({days:1, milliseconds:eventDelta});
        sched_time2 = sched_time.add(parseInt(acctWeekend(inDOW)), 'date');

        //console.log("next", sched_time2.format());

        return sched_time2; // wait until tomorrow
      }
    }

    else { // event type delay
      sched_time = moment.tz([inDate.year(), inDate.month(), inDate.date(), addHour, addMin], timeZone).add({days:addDay});
      sched_time2 = sched_time.add(parseInt(acctWeekend(inDOW)), 'days');
      //console.log("del", sched_time, acctWeekend(inDOW), sched_time2);

      return sched_time2;
    }
  }

  // handle weekend
  function acctWeekend(day) {
    if (addDay === 0) {
      if (sendWeekends == 'yes') {
        return 0;
      }
      else {
        if (day !== 6 && day !== 7) {
          return 0;
        }
        else if (day == 6) {
          return 2;
        }
        else {
          return 1;
        }
      }
    }
    else { // calc based on delay's sched_time

      if (day !== 6 && day !== 7) {
        return 0;
      }
      else if (day == 6) {
        return 2;
      }
      else {
          return 1;
        }
    }
  }
