import originalLangObject from "./source/vn.js";
import targetLangObject from "./source/cn.js";
import customTargetObject from "./source/addmore.js";
import fs from "fs";
import util from "util";
// region biến toàn cục
// danh sách các kết quả lỗi
let errorList = {};
let resultPath = "./output/result.js";
let errorResultPath = "./output/errorResult.js";
let logPath = "./output/log.txt";
let exportDefault = "export default ";
// end region biến toàn cục

translateNow();

// region xử lý file
function translateNow() {
  let startTime = performance.now();
  //reset error
  errorList = {};
  if (originalLangObject && targetLangObject && customTargetObject) {
    // thay thế các chữ cái tiếng việt bằng chữ cái tiếng trung
    let replaceLanguageText = replaceLanguage(
      originalLangObject,
      targetLangObject,
      customTargetObject
    );

    // lưu kết quả vào file output
    fs.writeFile(
      resultPath,
      exportDefault + util.inspect(replaceLanguageText),
      (err) => {
        if (err) throw err;
      }
    );
    // lưu thêm những kết quả lỗi
    fs.writeFile(
      errorResultPath,
      exportDefault + util.inspect(errorList),
      (err) => {
        if (err) throw err;
      }
    );
    let endTime = performance.now();
    // log thời gian chạy chương trình
    logTime(startTime, endTime);
  }
}

function logTime(startTime, endTime) {
  let seconds = Math.floor((endTime - startTime) / 1000);
  fs.writeFile(
    logPath,
    `thời gian chạy của chương trình lần gần nhất là ${seconds} giây`,
    (err) => {
      if (err) throw err;
    }
  );
}

function replaceLanguage(
  originalLangObject,
  targetLangObject,
  customTargetObject
) {
  let result = originalLangObject;

  for (const key in result) {
    if (Object.hasOwnProperty.call(result, key)) {
      const element = result[key];

      if (typeof element == "string") {
        //bo sung check neu trung value thi cung them vao error list
        checkValueIsSameByKey(originalLangObject, targetLangObject, key);

        if (
          targetLangObject &&
          targetLangObject.hasOwnProperty(key) &&
          targetLangObject[key]
        ) {
          result[key] = targetLangObject[key];
        } else if (
          customTargetObject &&
          customTargetObject.hasOwnProperty(key) &&
          customTargetObject[key]
        ) {
          result[key] = customTargetObject[key];
        } else {
          // thêm vào mảng để người dùng đọc được là tự dịch tay
          errorList[key] = result[key];
        }
      }
      // nếu key hiện tại có value là object thì gọi đệ quy
      if (typeof element == "object") {
        let targetLang = null;
        if (
          targetLangObject &&
          targetLangObject.hasOwnProperty(key) &&
          targetLangObject[key]
        ) {
          targetLang = targetLangObject[key];
        }
        result[key] = replaceLanguage(
          result[key],
          targetLang,
          customTargetObject
        );
      }
    }
  }
  return result;
}

/**
 * bo sung check neu trung value thi cung them vao error list
 */
function checkValueIsSameByKey(originalLangObject, targetLangObject, key) {
  if (
    key &&
    originalLangObject &&
    originalLangObject.hasOwnProperty(key) &&
    targetLangObject &&
    targetLangObject.hasOwnProperty(key) &&
    originalLangObject[key] == targetLangObject[key]
  ) {
    errorList[key] = originalLangObject[key];
  }
}

// end region xử lý file
