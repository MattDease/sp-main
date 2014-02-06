#pragma strict

var menuSkin : GUISkin;

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

private var playerName : String;
private var newName : String = "";
private var backgroundTexutre : Texture2D;
private var startBtnTexture : Texture2D;
private var headerText = 270;
private var bodyText = 60;
private var guiLogin : GuiClasses[];

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
    playerName = playerScript.getName();
    backgroundTexutre = Resources.Load("Textures/gui/background", Texture2D);
    startBtnTexture = Resources.Load("Textures/gui/startBtn", Texture2D);
    menuSkin = Resources.Load("MenuSkin", GUISkin);

    guiLogin = new GuiClasses[2];
    for (var x=0; x<guiLogin.length; x++){
        guiLogin[x] = new GuiClasses();
    }
}

function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.skin = menuSkin;

    GUI.DrawTexture(new Rect(0,0, Screen.width, Screen.height), backgroundTexutre);

    var labelStyle : GUIStyle = GUI.skin.GetStyle("Logo");
    labelStyle.fontSize = menuScript.getScale() * headerText;
    GUI.Label (new Rect (0, Screen.height/2 - Screen.height/8 , Screen.width, 0), "Scrambled", "Logo");

    var localStyle : GUIStyle = GUI.skin.GetStyle("PlainText");
    localStyle.fontSize = menuScript.getScale() * bodyText;

    GUI.skin.textField.fontSize = menuScript.getScale() * bodyText;

    if(playerName){
        GUI.Label(Rect(0,0, Screen.width, Screen.height + 60 ), "Welcome back, " + playerName, "PlainText");

        if(GUI.Button(Rect(0,0, Screen.width,Screen.height), "", "FullImage")){
            leaveFor(menus.main);
        }
    }
   else{
        guiLogin[0].textureWidth =  menuScript.getScale() * 400;
        guiLogin[0].textureHeight =  menuScript.getScale() * 100;
        guiLogin[0].pointLocation = Points.Center;
        guiLogin[0].updateLocation();

        guiLogin[1].textureWidth = 300;
        guiLogin[1].textureHeight = 100;
        guiLogin[1].pointLocation = Points.Center;
        guiLogin[1].updateLocation();


        GUI.Label(Rect(guiLogin[1].offset.x - Screen.width/7, guiLogin[1].offset.y + 20,  300, 100),"Enter your name:", "PlainText");
        newName = GUI.TextField(Rect (guiLogin[0].offset.x + Screen.width/7, guiLogin[0].offset.y + 20, menuScript.getScale() * 400, menuScript.getScale() * 100), newName, 20);
        if(newName && GUI.Button(Rect(0,0, Screen.width,Screen.height), "", "FullImage")){
            playerName = newName;
            playerScript.setName(newName);
            leaveFor(menus.main);
        }
    }

}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
