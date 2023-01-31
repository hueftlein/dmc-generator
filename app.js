const codes = JSON.parse(localStorage.getItem("codes") || '["Hello"]');
const history = JSON.parse(localStorage.getItem("history") || "[]");
let activeTab = parseInt(localStorage.getItem("activeTab")) || 0;

const tabTemplate = (i) =>
  `
    <li ${activeTab === i ? 'class="active"' : ""}>
        <a href="#" onClick="goToTab(${i})" data-content="${i}"></a>
        <a href="#" onClick="closeTab(${i})" class="close">✖</a>
    </li>
    `;

const newTabTemplate = `<li><a href="#" class="new" onClick="newTab()">➕</a></li>`;

const tabs = document.getElementById("tabs");

const updateTabs = () => {
  tabs.innerHTML =
    codes.map((_, i) => tabTemplate(i)).join("") + newTabTemplate;
};

const download = () => {
  if (codes[activeTab]) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([document.getElementById("svg").innerHTML], {
        type: "image/svg+xml",
      })
    );
    a.href = url;
    a.download = codes[activeTab] + ".svg";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
};

document.getElementById("svg").onclick = (e) => {
  e.preventDefault();
  download();
};

const updateTabContent = () => {
  document.getElementById("value").setAttribute("data-value", activeTab);
  document.getElementById("svg").replaceChildren(
    codes[activeTab]
      ? DATAMatrix({
          msg: codes[activeTab],
          dim: 256,
          pal: ["#000000", "#f2f4f8"],
        })
      : ""
  );
};

const historyTemplate = (i) =>
  `
    <li ${codes[activeTab] === history[i] ? 'class="active"' : ""}>
        <a href="#" onClick="fromHistory(${i})" data-history-content="${i}"></a>
    </li>
    `;

const historyElement = document.getElementById("history-content");
const updateHistory = () => {
  historyElement.innerHTML = history.map((_, i) => historyTemplate(i)).join("");
};

const fillCodes = (queryAttr, fillAttr, source) => {
  document.querySelectorAll(`[${queryAttr}]`).forEach((element) => {
    element[fillAttr] =
      fillAttr === "href"
        ? "#" +
          encodeURIComponent(
            source[parseInt(element.getAttribute(queryAttr))] || ""
          )
        : source[parseInt(element.getAttribute(queryAttr))] || "";
  });
};

const render = () => {
  document
    .querySelector(":root")
    .style.setProperty(
      "--tab-max-width",
      `${Math.min(50, 100 / codes.length)}%`
    );
  updateTabs();
  updateTabContent();
  updateHistory();
  fillCodes("data-content", "textContent", codes);
  fillCodes("data-content", "href", codes);
  fillCodes("data-history-content", "textContent", history);
  fillCodes("data-history-content", "href", history);
  fillCodes("data-value", "value", codes);
  window.location.hash = "#" + encodeURIComponent(codes[activeTab]);
  document.getElementById("value").focus();
  document.getElementById("value").select();
};

const generate = () => {
  codes[activeTab] = document.getElementById("value").value;
  if (history[0] !== codes[activeTab]) {
    history.unshift(codes[activeTab]);
  }
  localStorage.setItem("codes", JSON.stringify(codes));
  localStorage.setItem("history", JSON.stringify(history));
  render();
};

const goToTab = (i) => {
  activeTab = i;
  localStorage.setItem("activeTab", activeTab);
  render();
};

const closeTab = (i) => {
  codes.splice(i, 1);
  activeTab = Math.min(i--, 0);
  if (codes.length === 0) {
    codes.push("");
  }
  localStorage.setItem("codes", JSON.stringify(codes));
  localStorage.setItem("activeTab", activeTab);
  render();
};

const newTab = () => {
  codes.splice(activeTab + 1, 0, "");
  activeTab++;
  localStorage.setItem("codes", JSON.stringify(codes));
  localStorage.setItem("activeTab", activeTab);
  render();
};

const fromHistory = (i) => {
  const index = codes.indexOf(history[i]);
  if (index > -1) {
    activeTab = index;
  } else {
    newTab();
    codes[activeTab] = history[i];
  }
  localStorage.setItem("codes", JSON.stringify(codes));
  localStorage.setItem("activeTab", activeTab);
  render();
};

const fromUrl = () => {
  const code = decodeURIComponent(window.location.hash.substring(1));
  if (!code) {
    render();
    return;
  }
  const index = history.indexOf(code);
  if (index > -1) {
    fromHistory(index);
  } else {
    newTab();
    codes[activeTab] = code;
    if (history[history.length - 1] !== codes[activeTab]) {
      history.unshift(codes[activeTab]);
    }
  }
  localStorage.setItem("codes", JSON.stringify(codes));
  localStorage.setItem("activeTab", activeTab);
  localStorage.setItem("history", JSON.stringify(history));
  render();
};

fromUrl();
