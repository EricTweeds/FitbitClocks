import clock from "clock";
import { me as appbit } from "appbit";
import { battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import * as document from "document";

// Update the clock every minute
clock.granularity = "minutes";

const hourHand = document.getElementById("hours");
const minHand = document.getElementById("mins");
const hourPointer = document.getElementById("hours-pointer");
const minPointer = document.getElementById("mins-pointer");

const hourTip = document.getElementById("hours-tip");
const minTip = document.getElementById("mins-tip");

const dateText = document.getElementById("date");

const chargeBar = document.getElementById("battery-charge");

const hr = document.getElementById("hr");

let days = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];

function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}

// Rotate the hands every tick
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  
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
  
  // Date Management
  dateText.text = `${days[today.getDay()]} ${today.getMonth()}/${today.getDate()}`;

  // Clock Management
  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  
  hourPointer.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minPointer.groupTransform.rotate.angle = minutesToAngle(mins);
  
  hourTip.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minTip.groupTransform.rotate.angle = minutesToAngle(mins);
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
}

