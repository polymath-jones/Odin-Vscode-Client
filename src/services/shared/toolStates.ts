
var instance: ToolStates;


export class ToolStates {

  icons: { [key: string]: string } = {
    panel: "panel.svg",
    rightPanel: "rightPanel.svg",
    expand: "expand.svg",
    add: "add.svg",
    assets: "assets.svg",
    navigation: "navigation.svg",
    mobile: "mobile.svg",
    desktop: "desktop.svg",
    landscape: "landscape.svg",
    wide: "wide.svg",
    tablet: "tablet.svg",
    undo: "undo.svg",
    redo: "redo.svg",
    save: "save.svg",
    actions: "actions.svg",
    style: "style.svg",
    settings: "settings.svg",
    block: "block.svg",
    flex: "flex.svg",
    grid: "grid.svg",
    inlineBlock: "inline-block.svg",
    inline: "inline.svg",
    none: "none.svg",
  };

  screenButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  leftPaneButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  rightPaneButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  historyButtons = [{ id: "", source: "", placeholder: "" }];
  selectEntries = new Map<string, { text: string; iconSource: string }>();
  displayButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  stateEntries: Map<string, { text: string; iconSource: string; }>;


  private constructor() {

    for (let icon in this.icons) {
      const filename = this.icons[icon];
      const path = require(`../../assets/icons/${filename}`);
      this.icons[icon] = path;
    }

    this.screenButtons = [
      {
        id: "wide",
        source: this.icons["wide"],
        state: true,
        placeholder: ""
      },
      {
        id: "desktop",
        source: this.icons["desktop"],
        state: false,
        placeholder: ""
      },
      {
        id: "tablet",
        source: this.icons["tablet"],
        state: false,
        placeholder: ""
      },
      {
        id: "landscape",
        source: this.icons["landscape"],
        state: false,
        placeholder: ""
      },
      {
        id: "mobile",
        source: this.icons["mobile"],
        state: false,
        placeholder: ""
      },
    ];

    this.historyButtons = [
      {
        id: "undo",
        source: this.icons["undo"],
        placeholder: ""
      },
      {
        id: "redo",
        source: this.icons["redo"],
        placeholder: ""
      },
    ];

    this.rightPaneButtons = [
      {
        id: "style",
        source: this.icons["style"],
        placeholder: "Style",
        state: true
      },
      {
        id: "settings",
        source: this.icons["settings"],
        placeholder: "Settings",
        state: false
      },
      {
        id: "actions",
        source: this.icons["actions"],
        placeholder: "Actions",
        state: false
      },
    ];

    this.leftPaneButtons = [
      {
        id: "add",
        source: this.icons["add"],
        placeholder: "",
        state: false
      },
      {
        id: "navigation",
        source: this.icons["navigation"],
        placeholder: "",
        state: false
      },
      {
        id: "assets",
        source: this.icons["assets"],
        placeholder: "",
        state: false
      },
    ];

    this.selectEntries = new Map<string, { text: string; iconSource: string }>([
      ["item1", { text: "item1", iconSource: this.icons['settings'] }],
      ["item2", { text: "item2", iconSource: this.icons['settings'] }],
      ["item3", { text: "item3", iconSource: this.icons['settings'] }],
    ]);

    this.stateEntries = new Map<string, { text: string; iconSource: string }>([
      ["none", { text: "none", iconSource: '' }],
      ["hover", { text: "hover", iconSource: '' }],
      ["focus", { text: "focus", iconSource: '' }],
      ["active", { text: "active", iconSource: '' }],
      ["after", { text: "after", iconSource: '' }],
      ["before", { text: "before", iconSource: '' }],
     
    ]);

    this.displayButtons = [
      {
        id: "block",
        source: this.icons["block"],
        placeholder: "",
        state: true
      },
      {
        id: "flex",
        source: this.icons["flex"],
        placeholder: "",
        state: false
      },
      {
        id: "grid",
        source: this.icons["grid"],
        placeholder: "",
        state: false
      },
      {
        id: "inline-block",
        source: this.icons["inlineBlock"],
        placeholder: "",
        state: false
      },
      {
        id: "inline",
        source: this.icons["inline"],
        placeholder: "",
        state: false
      }, 
      {
        id: "none",
        source: this.icons["none"],
        placeholder: "",
        state: false
      }
    ];

  }
  static init() {
    if (!instance)
      instance = new ToolStates();
    else {
      console.log('Reattaching new Guidespace Instance');
      instance = new ToolStates();
    }
  }

  static getInstance(): ToolStates {
    if (instance != undefined) {
      return instance
    }
    else
      throw Error('ToolStates not instantiated');
  }
}
