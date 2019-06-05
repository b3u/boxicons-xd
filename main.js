const fs = require("uxp").storage.localFileSystem;
let clipboard = require("clipboard");

function init() {
    let UI = document.createElement('dialog');
    UI.id = "dialog";
    UI.innerHTML = `
        <style>
            #dialog form {
                width: 360px;
            }
            .h1 {
                align-items: center;
                justify-content: space-between;
                display: flex;
                flex-direction: row;
            }

            .icon {
                border-radius: 4px;
                width: 24px;
                height: 24px;
                overflow: hidden;
            }
        </style>
        <form id="iconDialog" method="dialog">
            <h1 class="h1">
                <span>Search Icons</span>
                <img class="icon" src="./images/icon@5x.png" />
            </h1>
            <hr />
            <p>Search for icons from the boxicon collection.</p>
            <label>
                <span>Search Icons</span>
                <input type="text" id="searchInput" placeholder="Search..."/>
            </label>
            <button id="searchBtn" uxp-variant="action">
                <img src="images/search@1x.png" />
            </button>
            <label>
                <span>Choose an Icon</span>
                <select id="dropdown">
                    <option selected value="none">Choose an icon</option>
                </select>
            </label>
            <footer>
                <button id="cancelBtn" uxp-variant="primary">Cancel</button>
                <button id="okBtn" type="submit" uxp-variant="cta">Copy to Clipboard</button>
            </footer>
        </form>
    `
    document.appendChild(UI)
}


async function handleSearch(term, type) {
    let iconList = require('./boxicons.json')

    let filteredList = iconList[type || 'regular'].filter(name => name.includes(term))
        
    return new Promise((resolve, reject) => filteredList ? resolve(filteredList) : reject("Uh Oh! Promise on main.js line 66 was rejected"))
}

async function handler() {
    let UI = document.getElementById('dialog')
    var svg;

    document.getElementById('searchBtn').addEventListener('click', async ev => {
        // Search for icons
        let fileList = await handleSearch(document.getElementById('searchInput').value);

        // Display search results
        let fileNames = fileList.map(n => n.replace('.svg', ''))
        try{
            fileNames.forEach((name, i) => {
                let option = document.createElement('option');
                option.innerText = name;
                option.value = fileList[i].name;
                // console.log(option)
                document.getElementById('dropdown').appendChild(option);
            })
        }
        catch(err){console.error(err)}

        svg = fileList.filter(n => n === document.getElementById('dropdown').value)[0]
    })

    document.getElementById('cancelBtn').addEventListener('click', () => {
        UI.close('reasonCanceled')
    })

    document.querySelector('form').addEventListener('submit', e => {
        e.preventDefault()
        UI.close("ok");
    })

    document.getElementById("okBtn").addEventListener("click", e => {
        e.preventDefault();
        UI.close("ok");
    })

    let response = await UI.showModal()
    if(response === 'ok') {
        if(!svg) return console.log('Too quick!');

        // const contents = await svg.read();
        clipboard.copyText(svg);
    }
}

init()

module.exports = {
    commands: {
        chooseIcon: handler
    }
}