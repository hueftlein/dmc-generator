const closeSvg = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 3L21 21" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M21 3L3 21" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
</svg>
`;

const addSvg = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3L12 21" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <path d="M21 12L3 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</svg>

`;

const codes = JSON.parse(localStorage.getItem("codes") || '["Hello"]');
const history = JSON.parse(localStorage.getItem("history") || "[]");
let activeTab = parseInt(localStorage.getItem("activeTab")) || 0;

const getTabClass = (isActive) =>
  `inline-flex flex-nowrap items-stretch border-r border-slate-900 dark:border-slate-300 ${isActive ? "bg-slate-100 dark:bg-slate-800 -mb-px" : ""
  }`;

const tabTemplate = (i) =>
  `
    <li class="${getTabClass(activeTab === i)}">
        <a href="#" onClick="goToTab(${i})" data-content="${i}" class="p-4 pr-2 truncate"></a>
        <a href="#" onClick="closeTab(${i})" class="p-4 pl-2 font-semibold text-xl inline-flex items-center">${closeSvg}</a>
    </li>
    `;

const newTabTemplate = `
<li class="${getTabClass()}">
  <a href="#" class="p-4 font-semibold text-xl inline-flex items-center" onClick="newTab()" >${addSvg}</a>
</li>`;

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

const updateTabContent = () => {
  document.getElementById("value").setAttribute("data-value", activeTab);
  document.getElementById("svg").replaceChildren(
    codes[activeTab]
      ? DATAMatrix({
        msg: codes[activeTab],
        dim: 256,
        pad: 1,
        pal: ["#000000", "#f2f4f8"],
      })
      : ""
  );
};

const historyTemplate = (i) =>
  `
  ${codes[activeTab] === history[i] ? "" : ""}
    <li class="">
        <a href="#" onClick="fromHistory(${i})" data-history-content="${i}" class="p-2 truncate block rounded hover:bg-slate-300"></a>
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

document.getElementById("download").onclick = (e) => {
  e.preventDefault();
  generate();
  download();
};

fromUrl();
