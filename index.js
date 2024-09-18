const login = require("facebook-chat-api");
const fs = require("fs");
const express = require("express");

const app = express();
const port = 3000;

// Define the schedule
const schedule = {
  "thứ 2": {
    morning: ["Chào cờ", "Sử - Hải", "Toán - Lựa", "Toán - Lựa"],
    afternoon: [
      "GDĐP-Mỹ thuật - Thắm",
      "GDĐP-Mỹ thuật - Thắm",
      "GDĐP-Mỹ thuật - Thắm",
      "TN-HN - Dũng N",
    ],
  },
  "thứ 3": {
    morning: ["Toán - Lựa", "Toán - Lựa", "Tin - Ngọc", "Tin - Ngọc"],
    afternoon: [
      "GDĐP-Văn - Thư",
      "GDĐP-Văn - Thư",
      "GDĐP-Văn - Thư",
      "TN-HN - Dũng N",
    ],
  },
  "thứ 4": {
    morning: ["Hóa - Huy", "Tin - Ngọc", "NNgữ - Dũng N", "NNgữ - Dũng N"],
    afternoon: [
      "GDĐP KT-PL - Thu B",
      "GDĐP KT-PL - Thu B",
      "GDĐP KT-PL - Thu B",
    ],
  },
  "thứ 5": {
    morning: ["Lí - Tấn", "Sinh - Đang", "Sinh - Đang", "Văn - Thư"],
    afternoon: ["GDĐP-Địa - Trí", "GDĐP-Địa - Trí", "GDĐP-Địa - Trí"],
  },
  "thứ 6": {
    morning: ["GDQP-AN - Quá", "Văn - Thư", "Văn - Thư", "Hóa - Huy"],
    afternoon: ["GDTC - Linh N", "GDTC - Linh N"],
  },
  "thứ 7": {
    morning: ["Lí - Tấn", "Sinh - Đang", "NNgữ - Dũng N", "SHL - Dũng N"],
    afternoon: ["GDĐP-Nhạc - Tý", "GDĐP-Nhạc - Tý", "GDĐP-Nhạc - Tý"],
  },
};

// Helper function to get tomorrow's schedule
function getTomorrowSchedule() {
  const daysOfWeek = ["thứ 2", "thứ 3", "thứ 4", "thứ 5", "thứ 6", "thứ 7"];
  const today = new Date().getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6

  const tomorrowIndex = today === 6 ? 0 : today; // Loop back to "thứ 2" on Sunday
  const tomorrow = daysOfWeek[tomorrowIndex];

  return getSchedule(tomorrow);
}

// Function to get the schedule for a specific day
function getSchedule(day) {
  const lowerCaseDay = day.toLowerCase();
  const daySchedule = schedule[lowerCaseDay];
  if (!daySchedule) return "Không tìm thấy thời khóa biểu cho ngày này.";

  const morning = daySchedule.morning.join(", ");
  const afternoon = daySchedule.afternoon.join(", ");

  // Randomize responses
  const responses = [
    "Dạ, hôm nay mẹ học môn này nhé: ",
    "Để con xem nào... Dạ, đây là thời khóa biểu hôm nay của mẹ: ",
    "À, hôm nay mẹ học các môn này nè: ",
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return `${randomResponse}\nBuổi sáng: ${morning}\nBuổi chiều: ${afternoon}`;
}

// Add random delay for natural responses
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Facebook Chat API Login
login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  (err, api) => {
    if (err) {
      console.error("Login error:", err);
      return;
    }

    // Start listening for messages
    api.listenMqtt((err, message) => {
      if (err) {
        console.error("Error in message listener:", err);
        return;
      }

      console.log("Received message:", message);

      const msgBody = message.body;
      if (msgBody && msgBody.includes("tiểu bảo")) {
        setTimeout(() => {
          api.sendMessage("Dạ có con", message.threadID);
        }, randomDelay(2000, 6000)); // Random delay of 2-6 seconds
      }

      if (msgBody && msgBody.includes("học gì")) {
        setTimeout(() => {
          const days = ["thứ 2", "thứ 3", "thứ 4", "thứ 5", "thứ 6", "thứ 7"];
          let response = "Dạ, Tiểu Bảo vẫn chưa hiểu ý của mẹ ạ.";

          // Check if the user asks for tomorrow's schedule
          if (msgBody.includes("ngày mai")) {
            response = getTomorrowSchedule();
          } else {
            // Look for specific days in the message
            days.forEach((day) => {
              if (msgBody.includes(day)) {
                response = getSchedule(day);
              }
            });
          }

          // Occasionally add a natural comment
          const additionalComments = [
            "Hôm nay mẹ có vui không ạ?",
            "Con thấy trời đẹp quá mẹ ơi!",
            "À mẹ nhớ ăn sáng nhé!",
          ];

          if (Math.random() < 0.3) { // 30% chance to add an additional comment
            const randomComment = additionalComments[Math.floor(Math.random() * additionalComments.length)];
            response += `\n${randomComment}`;
          }

          // Add random "clarification" response sometimes
          const clarificationResponses = [
            "Dạ, mẹ có thể nói lại giúp con không ạ?",
            "Con chưa rõ lắm, mẹ hỏi lại được không ạ?",
          ];

          if (Math.random() < 0.1) { // 10% chance to ask for clarification
            api.sendMessage(clarificationResponses[Math.floor(Math.random() * clarificationResponses.length)], message.threadID);
          } else {
            api.sendMessage(response, message.threadID);
          }
        }, randomDelay(4000, 10000)); // Random delay of 4-8 seconds
      }
    });
  }
);

// Express server setup
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
