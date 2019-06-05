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

            .search-btn-cont {
                display: flex;
                justify-content: flex-end;
            }

            .type-input-cont {
                display: flex;
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
            <label class="type-input-cont">
                <span>Icon Type</span>
                <select id="type">
                    <option selected value="regular">Regular</option>
                    <option value="solid">Solid</option>
                    <option value="logos">Logos</option>
                </select>
            </label>
            <label>
                <span>Search Icons</span>
                <input type="text" id="searchInput" placeholder="Search..."/>
            </label>
            <div class="search-btn-cont">
                <button id="searchBtn" uxp-variant="action">
                    <img src="images/search@1x.png" />
                </button>
            </div>
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

    // Clear form
    document.getElementById('searchInput').value = ""
    document.getElementById('dropdown').innerHTML = "<option selected value='none'>Choose an icon</option>"

    document.getElementById('searchBtn').addEventListener('click', async ev => {
        // Search for icons
        let fileList = await handleSearch(document.getElementById('searchInput').value, document.getElementById('type').value);

        // Display search results
        fileList.forEach((name, i) => {
            let option = document.createElement('option');
            option.innerHTML = name.replace('.svg', '');
            option.value = name;
            document.getElementById('dropdown').appendChild(option);
        })
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
        let fileName = document.getElementById('dropdown').value;
        if(fileName === 'none') return console.log('No icon choice detected.');

        const iconType = document.getElementById('type').value;

        const pluginFolder = await fs.getPluginFolder();
        const pluginEntries = await pluginFolder.getEntries();

        const iconFolder = await pluginEntries.filter(f => f.name === 'boxicons@2.0.2')[0]
        const iconEntries = await iconFolder.getEntries();

        const typeFolder = await iconEntries.filter(f => f.name === iconType)[0]
        const typeEntries = await typeFolder.getEntries()

        const aFile = await typeEntries.filter(f => f.name === fileName)[0];

        const contents = await aFile.read();
        clipboard.copyText(contents);
    }
}

init()

module.exports = {
    commands: {
        chooseIcon: handler
    }
}