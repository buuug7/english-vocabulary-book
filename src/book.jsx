/**
 * @typedef {import('node_modules/@types/react/index.d.ts').React} React
 * @typedef {import('node_modules/@types/react-dom/index.d.ts').ReactDOM} ReactDOM
 */

const { useEffect, useState } = React;
const __q = (selector) => document.querySelector(selector);

function HeaderLeft({ words }) {
  const [translator, setTranslator] = useState(false);

  useEffect(() => {
    getTranslateVendor().then((r) => {
      setTranslator(!!r);
    });
  }, []);

  const translateChangeHandler = (event) => {
    const checked = event.target.checked;
    setTranslateVendor(checked ? "google" : "").then(() => {
      location.reload();
    });
  };

  return (
    <div className="header-left display-flex flex-center">
      <img src="/images/icon-32x32.png" className="logo" alt="logo" />
      <span className="mx-2" style={{ fontSize: "1.1rem" }}>
        生词本 {`(${words.length})`}
      </span>
      <div className="form-check translate-setting mx-1 ">
        <label className="form-check-label">use google translate</label>
        <input
          className="form-check-input"
          type="checkbox"
          checked={translator}
          onChange={translateChangeHandler}
        />
      </div>
      <div className="form-check toggle-view ml-2 mx-1 ">
        <label className="form-check-label">toggle view</label>
        <input
          className="form-check-input"
          type="checkbox"
          onChange={() => {
            __q(".word-list").classList.toggle("grid-column-2");
          }}
        />
      </div>
    </div>
  );
}

function HeaderRight({ words }) {
  const selectedItems = words.filter((it) => it.checked);
  const ids = selectedItems.map((it) => it.id);
  const texts = selectedItems.map((it) => it.text);
  const deleteCount = ids.length;

  const deleteHandler = () => {
    const _confirm = window.confirm(
      `Do you really want to delete <${texts.join(",")}> words?`
    );

    if (!_confirm) {
      return;
    }

    deleteWordByIds(ids).then(() => {
      location.reload();
    });
  };

  const exportHandler = () => {
    getWords().then((words) => {
      if (words.length === 0) {
        sendNotification(`There is no collected words for export!`);
        return;
      }

      const _words = words.map((item) => item.text);
      const data = JSON.stringify(_words, null, 4);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `collect-new-english-words-${generateUID()}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const buttonText = `delete ${deleteCount ? "(" + deleteCount + ")" : ""}`;

  return (
    <div className="header-right">
      <button
        className={`btn small ${deleteCount > 0 ? "primary" : "disabled"}`}
        onClick={deleteHandler}
      >
        {buttonText}
      </button>

      <button className="btn small nowrap primary ml-2" onClick={exportHandler}>
        export
      </button>
    </div>
  );
}

function Header({ words }) {
  return (
    <div className="header display-flex align-items-center mb-2 px-4">
      <HeaderLeft words={words} />
      <HeaderRight words={words} />
    </div>
  );
}

function Word({ word, itemSelected }) {
  const [translator, setTranslator] = useState("");

  useEffect(() => {
    getTranslateVendor().then((r) => {
      setTranslator(r);
    });
  }, []);

  const detailLink =
    translator === "google"
      ? `https://translate.google.com/?sl=en&tl=zh-CN&text=${word.text}&op=translate`
      : `https://fanyi.baidu.com/#en/zh/${word.text}`;

  const onChangeHandler = (event) => {
    itemSelected({
      ...word,
      checked: event.target.checked,
    });
  };

  return (
    <div className="word">
      <div className="form-check inline">
        <input
          className="form-check-input"
          type="checkbox"
          checked={!!word.checked}
          onChange={onChangeHandler}
        />
      </div>
      <a href={detailLink} className="ml-2 word-text" target="_blank">
        {word.text}
      </a>
    </div>
  );
}

function WordList({ words, itemSelected }) {
  return (
    <div className="word-list px-4 mb-4">
      {words.map((word) => (
        <Word word={word} key={word.id} itemSelected={itemSelected} />
      ))}
    </div>
  );
}

function App() {
  const [words, setWords] = useState([]);
  useEffect(() => {
    getWords().then((r) => {
      setWords(r);
    });
  }, []);

  const itemSelectedCallback = (item) => {
    setWords((prevState) => {
      return prevState.map((preItem) => {
        return preItem.id === item.id ? item : preItem;
      });
    });
  };

  return (
    <div className="app">
      <Header words={words} />
      <WordList words={words} itemSelected={itemSelectedCallback} />
    </div>
  );
}

ReactDOM.render(<App />, __q("#root"));
