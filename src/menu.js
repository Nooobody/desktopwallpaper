const electron = require("electron");
const { ipcMain, Menu, MenuItem, clipboard } = electron;

export default function initContextMenu(mainWindow, wnd) {
  let template;

  const changeTemplate = (id, label, click, submenu) => {
    for (let item of template) {
      if (item.id === id) {
        item.label = label;
        item.click = click;
        item.submenu = submenu;
        break;
      }
    }
  }

  const stopBackground = () => {
    changeTemplate("background-stop", "Resume background changing", resumeBackground, undefined);
    template.splice(1, 1);
    mainWindow.send("contextmenu", "stopBackground");
  }

  const resumeBackground = () => {
    changeTemplate("background-stop", "Stop changing background temporarily", stopBackground, undefined);
    template.splice(1, 0, {
      label: "Next background",
      click() {
        mainWindow.send("contextmenu", "nextBackground");
      }
    });
    mainWindow.send("contextmenu", "resumeBackground");
  }

  const forceTag = (tag) => {
    mainWindow.send("forceTag", tag);
    changeTemplate("force-tag", "Stop forcing a tag", stopForcing, undefined);
  }

  const stopForcing = () => {
    mainWindow.send("contextmenu", "stopForcing");
    changeTemplate("force-tag", "Force a tag --->", undefined, []);
  }

  const saveToFavorites = () => {
    mainWindow.send("contextmenu", "favorite");
    template[0].label = "Already saved to favorites!";
    template[0].click = () => {};
  }

  template = [
    {
      label: "Save background to Favorites",
      click: saveToFavorites
    },
    {
      label: "Next background",
      click() {
        mainWindow.send("contextmenu", "nextBackground");
      }
    },
    {
      label: 'Stop changing background temporarily',
      id: "background-stop",
      click: stopBackground
    },
    {
      label: 'Copy background link',
      id: "background-link"
    },
    {
      label: 'Force a Tag --->',
      id: 'force-tag',
      submenu: []
    },
    {
      label: 'Image tag: ',
      id: "background-tag"
    },
    {
      label: "All Image Tags --->",
      id: "background-all-tags",
      submenu: []
    },
    {
      label: "Refresh display",
      click() {
        const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
        wnd.setBounds({
          x: 0,
          y: 0,
          width,
          height
        });
      }
    }
  ];

  ipcMain.on('set_tags', (_, tags) => {
    for (let item of template) {
      if (item.id === 'force-tag') {
        item.label = "Force a tag --->";
        item.click = undefined;
        if (tags) {
          item.submenu = tags.map(t => ({
            label: t,
            click() {
              forceTag(t)
            }
          }))
        }
        break;
      }
    }
  });

  ipcMain.on('bg_image', (_, image, tag, all_tags) => {
    if (tag === "Favorite") {
      template[0].label = "Already saved to favorites!";
      template[0].click = () => {};
    }
    else {
      template[0].label = "Save background to Favorites";
      template[0].click = saveToFavorites;
    }

    for (let item of template) {
      if (item.id === "background-tag") {
        item.label = "Image tag: " + tag;
      }
      else if (item.id === "background-link") {
        item.click = () => {
          clipboard.writeText(image);
        }
      }
      else if (item.id === "background-all-tags") {
        item.submenu = all_tags.map(t => {return {
          label: t,
          click() {
            clipboard.writeText(t);
          }
        }});
      }
    }
  });

  ipcMain.on('contextmenu', () => {
    const menu = Menu.buildFromTemplate(template);
    menu.popup({});
  })
}
