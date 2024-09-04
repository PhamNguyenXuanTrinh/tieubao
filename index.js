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

// Function to get the schedule for a day
function getSchedule(day) {
  const lowerCaseDay = day.toLowerCase();
  const daySchedule = schedule[lowerCaseDay];
  if (!daySchedule) return "Không tìm thấy thời khóa biểu cho ngày này.";

  const morning = daySchedule.morning.join(", ");
  const afternoon = daySchedule.afternoon.join(", ");

  return `Thời khóa biểu ${day} " của mẹ Thiên Kim XINH ĐẸP NHẤT THẾ GIỚI LÀ" :\nBuổi sáng: ${morning}\nBuổi chiều: ${afternoon}`;
}

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  (err, api) => {
    if (err) return console.error(err);

    api.listenMqtt((err, message) => {
      if (err) return console.error(err);

      console.log("Received message:", message); // Log the message object

      const msgBody = message.body;
      if (msgBody && msgBody.includes("tiểu bảo"))
        api.sendMessage("Dạ có con", message.threadID);
      if (msgBody && msgBody.includes("học gì")) {
        // Check if msgBody is defined
        const days = ["thứ 2", "thứ 3", "thứ 4", "thứ 5", "thứ 6", "thứ 7"];
        let response = "dạ, Tiểu Bảo vẫn chưa hiểu ý của mẹ ạ";

        days.forEach((day) => {
          if (msgBody.includes(day)) {
            response = getSchedule(day);
          }
        });

        api.sendMessage(response, message.threadID);
      }
    });
  }
);

app.listen(port, () => {
  console.log(`Máy chủ đang lắng nghe tại http://localhost:${port}`);
});
