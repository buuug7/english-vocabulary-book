function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

function getTranslateVendor() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("translateVendor", (data) => {
      resolve(data["translateVendor"]);
    });
  });
}

function setTranslateVendor(vendor) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(
      {
        translateVendor: vendor,
      },
      () => {
        // sendNotification(`Translate is set to ${vendor ? vendor: 'baidu'}`);
        resolve(vendor);
      }
    );
  });
}

async function getWords() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("words", (data) => {
      resolve(data["words"] || []);
    });
  });
}

function sendNotification(message) {
  chrome.notifications.create(`${generateUID()}`, {
    message: message,
    title: "collect new english words",
    type: "basic",
    iconUrl: "images/icon-64x64.png",
  });
}

/**
 *
 * @param {string} str
 * @param {Array} words
 * @return {Promise<string>}
 */
async function addWord(str, words) {
  let _str = str.trim();

  if (!_str) {
    return "";
  }

  _str = _str.toLowerCase();
  const arr = _str.split(" ").filter((it) => it.length > 0);

  const duplicate = [];
  const needAdded = [];

  for (let text of arr) {
    const index = words.findIndex((it) => it.text === text);
    index !== -1 ? duplicate.push(text) : needAdded.push(text);
  }

  if (duplicate.length > 0) {
    sendNotification(`<${duplicate.join(", ")}> is already collected.`);
  }

  const _newWords = needAdded.map((text) => {
    return {
      id: generateUID(),
      text: text,
    };
  });

  return updateWords([..._newWords, ...words]);
}

/**
 *
 * @param words
 * @return {Promise<string>}
 */
async function updateWords(words) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(
      {
        words: words,
      },
      () => {
        resolve("update successfully!");
      }
    );
  });
}

/**
 *
 * @param {Array} ids
 * @return {Promise<string>}
 */
async function deleteWordByIds(ids) {
  const words = await getWords();
  const filteredWords = words.filter((it) => {
    return !ids.includes(it.id);
  });
  return await updateWords(filteredWords);
}
