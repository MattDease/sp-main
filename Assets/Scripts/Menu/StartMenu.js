#pragma strict

private var menuSkin : GUISkin;

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

private var playerName : String;
private var newName : String = "";
private var backgroundTexutre : Texture2D;
private var startBtnTexture : Texture2D;
private var logoTexture: Texture2D;
private var whiteBarTexture : Texture2D;
private var createNewOverlayTexture : Texture2D;

private var headerText = 270;
private var bodyText = 60;
private var guiLogin : GuiClasses[];
private var guiName: GuiClasses [];


function Start() {
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
    playerName = playerScript.getName();
    backgroundTexutre = Resources.Load("Textures/gui/background", Texture2D);
    startBtnTexture = Resources.Load("Textures/gui/startBtn", Texture2D);
    logoTexture = Resources.Load("Textures/gui/logo", Texture2D);
    whiteBarTexture = Resources.Load("Textures/gui/whiteBar", Texture2D);
    createNewOverlayTexture = Resources.Load("Textures/gui/createNewOverlay", Texture2D);
    menuSkin = Resources.Load("MenuSkin", GUISkin);

    guiLogin = new GuiClasses[3];
    for (var x = 0; x < guiLogin.length; x++) {
        guiLogin[x] = new GuiClasses();
    }

    guiName = new GuiClasses[5];
    for (var z = 0; z < guiName.length; z++) {
        guiName[z] = new GuiClasses();
    }
}

function OnGUI() {
    if (!showMenu) {
        return;
    }
    GUI.skin = menuSkin;

    GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), backgroundTexutre);

    var localStyle: GUIStyle = GUI.skin.GetStyle("PlainText");
    localStyle.fontSize = menuScript.getScale() * bodyText;

    GUI.skin.textField.fontSize = menuScript.getScale() * bodyText;

    if (playerName) {
            guiLogin[2].textureWidth = 1500 * menuScript.getScale();
            guiLogin[2].textureHeight = 1001 * menuScript.getScale();
            guiLogin[2].setLocation(Points.Center);
            GUI.DrawTexture(new Rect(guiLogin[2].offset.x, guiLogin[2].offset.y - Screen.height/16, guiLogin[2].textureWidth,  guiLogin[2].textureHeight), logoTexture);
            GUI.DrawTexture(new Rect(0, Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), whiteBarTexture);
            GUI.Label(new Rect(0,  Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), "Welcome back, " + playerName, "PlainText");

        if (GUI.Button(Rect(0, 0, Screen.width, Screen.height), "", "FullImage")) {
            leaveFor(menus.lobby);
        }
    } else {

         guiLogin[2].textureWidth = 1000 * menuScript.getScale();
         guiLogin[2].textureHeight = 667 * menuScript.getScale();
         guiLogin[2].setLocation(Points.Center);

        guiLogin[0].textureWidth = Screen.width/3;
        guiLogin[0].textureHeight = menuScript.getScale() * 100;
        guiLogin[0].setLocation(Points.Center);

        guiLogin[1].textureWidth = 300;
        guiLogin[1].textureHeight = 100;
        guiLogin[1].setLocation(Points.Center);

        GUI.DrawTexture(new Rect(guiLogin[2].offset.x, guiLogin[2].offset.y - Screen.height/4, guiLogin[2].textureWidth,  guiLogin[2].textureHeight), logoTexture);

        guiName[0].textureWidth = Screen.width;
        guiName[0].textureHeight = 100;
        guiName[0].setLocation(Points.Center);

        guiName[1].textureWidth = Screen.width / 2.2;
        guiName[1].textureHeight = menuScript.getScale() * 100;
        guiName[1].setLocation(Points.Center);

        guiName[2].textureWidth = Screen.width / 5.5;
        guiName[2].textureHeight = Screen.height / 10;
        guiName[2].setLocation(Points.Center);

        guiName[3].textureWidth = Screen.width / 1.5;
        guiName[3].textureHeight = Screen.height / 3;
        guiName[3].setLocation(Points.Center);

        GUI.DrawTexture(new Rect(guiName[3].offset.x, guiName[3].offset.y + guiName[3].offset.y/2, Screen.width / 1.5, Screen.height / 3), createNewOverlayTexture);

        GUI.Label(Rect(guiName[0].offset.x, guiName[0].offset.y - Screen.height / 12 + guiName[3].offset.y/2, Screen.width, 100), "Enter your name", "PlainText");
        newName = GUI.TextField(Rect(guiName[1].offset.x, guiName[1].offset.y + Screen.height/22 + guiName[3].offset.y/2, Screen.width / 2.2, menuScript.getScale() * 100), newName, 20);

        if(newName) {
            GUI.DrawTexture(new Rect(0, Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), whiteBarTexture);
            GUI.Label(new Rect(0,  Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), "Tap to Continue", "PlainText");
        }

        if (newName && GUI.Button(Rect(0, 0, Screen.width, Screen.height), "", "FullImage")) {
            playerName = newName;
            playerScript.setName(newName);
            leaveFor(menus.lobby);
        }
    }

}

function enter() {
    showMenu = true;
}

function leaveFor(newMenu: menus) {
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
