//const csvUrl = "https://docs.google.com/spreadsheets/d/1HiprplQ4zQmv6OvIWkssvJBJ_iYq7s4wIl2l8cayWt4/export?format=csv";
const csvUrl= "data1.csv"
let dictionaryData = [];
let currentLetter = "A";

const posColors = {
    noun: "#64b5f6",
    verb: "#81c784",
    adjective: "#ffb74d",
    adverb: "#ba68c8"
};

async function loadCSV() {
    try {
        const response = await fetch(csvUrl);
        const data = await response.text();
        const rows = data.split("\n").slice(1);
        dictionaryData = rows.map(row => {
            const [word, wordclass, meaning, sentence, pronunciation] = row.split(",").map(x => x?.trim());
            return { word, wordclass, meaning, sentence, pronunciation };
        });
        generateAlphabetNav();
        showGlossaryLetter("A");
    } catch (error) {
        console.error("Error loading CSV:", error);
        document.getElementById("result").innerHTML = `<p style="color:red;">❌ Failed to load CSV data.</p>`;
    }
}

function searchWord() {
    const query = document.getElementById("searchBox").value.trim().toLowerCase();
    const resultDiv = document.getElementById("result");
    const autocompleteList = document.getElementById("autocomplete-list");
    resultDiv.innerHTML = "";
    autocompleteList.innerHTML = "";

    if (!query) return;

    const matches = dictionaryData.filter(item => item.word.toLowerCase() === query);
    const suggestions = dictionaryData.filter(item => item.word.toLowerCase().includes(query)).slice(0, 5);

    if (matches.length === 0) {
        resultDiv.innerHTML = `<div class='card'>❌ No exact match found.</div>`;
        if (suggestions.length > 0) {
            const suggestionHTML = suggestions.map(s => `<span class="suggestion" onclick="showWordDetail(${dictionaryData.indexOf(s)}, '${query}')">${s.word}</span>`).join(", ");
            resultDiv.innerHTML += `<div class='card'><strong>Did you mean:</strong> ${suggestionHTML}</div>`;
        }
        return;
    }

    showWordDetail(dictionaryData.indexOf(matches[0]), query);
}

function showWordDetail(index, query) {
    const item = dictionaryData[index];
    const resultDiv = document.getElementById("result");

    let pronunciation = item.pronunciation ? `<div class="pronunciation">/${item.pronunciation}/</div>` : "";
    let posBadge = item.wordclass ? `<div class="pos-badge" style="background-color:${posColors[item.wordclass?.toLowerCase()] || '#777'}">${item.wordclass}</div>` : "";

    let sentenceHtml = "";
    if (item.sentence) {
        const regex = new RegExp(`\\b(${query})\\b`, "gi");
        const highlightedSentence = item.sentence.replace(regex, `<span class="highlighted">$1</span>`);
        sentenceHtml = `<div class="sentence"><strong>Example:</strong> ${highlightedSentence}</div>`;
    }

    resultDiv.innerHTML = `
        <div class="card result-card">
            <div class="word">${item.word}</div>
            ${pronunciation}
            ${posBadge}
            <div class="definition">${item.meaning || ""}</div>
            ${sentenceHtml}
        </div>
    `;
}

// Glossary
function showGlossaryLetter(letter) {
    currentLetter = letter;
    const glossaryDiv = document.getElementById("glossary-list");
    glossaryDiv.innerHTML = "";
    const filtered = dictionaryData.filter(item => item.word?.charAt(0)?.toUpperCase() === letter);

    if (filtered.length === 0) {
        glossaryDiv.innerHTML = `<div class="card">No words found for ${letter}.</div>`;
        return;
    }

    const title = `<div class="letter-title">${letter}</div>`;
    const wordsHtml = filtered
        .map(item => {
            const posBadge = item.wordclass ? `<div class="pos-badge" style="background-color:${posColors[item.wordclass?.toLowerCase()] || '#777'}">${item.wordclass}</div>` : "";
            return `<div class='card'><div class='word'>${item.word}</div>${posBadge}<div class='definition'>${item.meaning}</div></div>`;
        })
        .join("");

    glossaryDiv.innerHTML = title + wordsHtml;

    document.querySelectorAll(".alphabet-nav button").forEach(btn => btn.classList.remove("active-letter"));
    document.querySelector(`.alphabet-nav button[data-letter="${letter}"]`)?.classList.add("active-letter");
}

function generateAlphabetNav() {
    const nav = document.getElementById("alphabet-nav");
    nav.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.setAttribute("data-letter", letter);
        btn.onclick = () => showGlossaryLetter(letter);
        nav.appendChild(btn);
    }
    nav.querySelector("button[data-letter='A']").classList.add("active-letter");
}

function openTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.getElementById(tabName).classList.add("active");
    document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add("active");
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}

window.onload = loadCSV;
