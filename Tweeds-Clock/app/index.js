import clock from "clock";
import { me as appbit } from "appbit";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import { today } from "user-activity";
import { display } from "display";
import { weekGoals, week } from "user-activity";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";

// Update the clock every minute
clock.granularity = "seconds";

// Get a handle on the <text> element
const time = document.getElementById("time");
const hr = document.getElementById("hr");
const bat = document.getElementById("bat");
const step = document.getElementById("step");
const chargeBar = document.getElementById("chargeBar");
const goalGauge = document.getElementById("goal");
const cur = document.getElementById("current");
const tar = document.getElementById("target");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  time.text = `${hours}:${mins}`;
  
  // Battery Managment
  let charge = battery.chargeLevel;
  let chargeWidth = (charge / 100) * 23;
  
  chargeBar.width = chargeWidth;
  
  if (charge <= 25) {
    chargeBar.style.fill = "#FF0000";
  } else if (charge <= 50) {
    chargeBar.style.fill = "#FFFF00";
  } else {
    chargeBar.style.fill = "#00FF00";
  }
  
  if (appbit.permissions.granted("access_activity")) {
    let target = weekGoals.activeZoneMinutes;
    let current = week.adjusted.activeZoneMinutes;
    if (target > 0) {
      let completePercent = current / target;

      if (completePercent <= 0.5) {
        goalGauge.style.fill = "#FF0000";
      } else if (completePercent <= 0.9) {
        goalGauge.style.fill = "#FFFF00";
      } else {
        goalGauge.style.fill = "#00FF00";
      }
      
      cur.text = current;
      
      tar.text = target;
      
      let angle = 360 * completePercent;
 
      goalGauge.sweepAngle = angle;
    }
  }
}

if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
   const hrm = new HeartRateSensor();

   hrm.addEventListener("reading", () => {
        hr.text = hrm.heartRate;
   });

   display.addEventListener("change", () => {
     // Automatically stop the sensor when the screen is off to conserve battery
     display.on ? hrm.start() : hrm.stop();
   });

   hrm.start();
} else {
   console.log("This device does NOT have a HeartRateSensor!");
}

if (appbit.permissions.granted("access_activity")) {
  step.text = today.adjusted.steps;
}


