#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

//Gui class and variables
var Gui : GuiClasses;
var GuiCharacter : GuiClasses[];
var GuiReady : GuiClasses;
var GuiBack: GuiClasses;
var GuiCharacterNext: GuiClasses;
var GuiCharacterBack: GuiClasses;

enum Point4 {TopLeft, TopRight, BottomLeft, BottomRight, Center}

var characterSelect : boolean = false;
var selectMenu; //Check which menu the player selected

//Textures and skins
var menuSkin : GUISkin;
var quickGameTexture : Texture2D;
var newGameTexture : Texture2D;
var joinGameTexture : Texture2D;
var observeTexture : Texture2D;
var backTexture : Texture2D;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;

    menuSkin = Resources.LoadAssetAtPath("Assets/MenuSkin.guiskin", GUISkin);
    quickGameTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/quickgame.jpg", Texture2D);
    newGameTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/newgame.jpg", Texture2D);
    joinGameTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/joingame.jpg", Texture2D);
    backTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/back.jpg", Texture2D);

    GuiCharacter = new GuiClasses[10];
    for (var x =0; x<10; x++){
        GuiCharacter[x] = new GuiClasses();
    }
}

function OnGUI (){
    GUI.skin = menuSkin;
    var screenW = Screen.width;
    var screenH = Screen.height;

    var newWidth = Screen.width*0.8;
    var newHeight = Screen.height*0.8;

    Gui.textureWidth = 310;
    Gui.textureHeight = 160;
    
    GuiBack.textureWidth = backTexture.width;
    GuiBack.textureHeight = backTexture.height;

    Gui.updateLocation();
    Gui.pointLocation = Point4.Center;

    for (var i=0; i<10; i++){
        GuiCharacter[i].textureWidth = Screen.width*0.2;
        GuiCharacter[i].textureHeight = Screen.height*0.5;
        GuiCharacter[i].pointLocation = Point4.Center;
    }

    if(!showMenu){
        return;
    }

    if (characterSelect == true){
        
        //Back Button
        if(GUI.Button(Rect(GuiBack.offset.x + GuiBack.offsetY03 ,GuiBack.offset.y + GuiBack.offsetY03 ,backTexture.width,backTexture.height), backTexture)){
          characterSelect = false;
        }

        GUI.Box(Rect(GuiCharacter[1].offset.x, GuiCharacter[1].offset.y - GuiCharacter[1].offsetY03,  Screen.width*0.2, Screen.height*0.5), "Char 1");
        GUI.Box(Rect(GuiCharacter[2].offset.x - newWidth*0.33, GuiCharacter[2].offset.y - GuiCharacter[1].offsetY03, Screen.width*0.2, Screen.height*0.5), "Char 2");
        GUI.Box(Rect(GuiCharacter[3].offset.x + newWidth*0.33, GuiCharacter[3].offset.y - GuiCharacter[1].offsetY03, Screen.width*0.2, Screen.height*0.5), "Char 3");

        for (i=0; i<10; i++){
            GuiCharacter[i].updateLocation();
        }

        //Button location
        GuiCharacterNext.pointLocation = Point4.Center;
        GuiCharacterNext.textureWidth = Screen.width*0.08;
        GuiCharacterNext.textureHeight = Screen.height*0.3;
        GuiCharacterNext.updateLocation();

        GuiCharacterBack.pointLocation = Point4.Center;
        GuiCharacterBack.textureWidth = Screen.width*0.08;
        GuiCharacterBack.textureHeight = Screen.height*0.3;
        GuiCharacterBack.updateLocation();

        GUI.Box(Rect(Screen.width - Screen.width*0.08 - Screen.width*0.02, GuiCharacterNext.offset.y - GuiCharacterNext.offsetY03,  Screen.width*0.08, Screen.height*0.3), ">>");
        GUI.Box(Rect(0 + Screen.width*0.02, GuiCharacterBack.offset.y - GuiCharacterBack.offsetY03,  Screen.width*0.08, Screen.height*0.3), "<<");


        GuiReady.pointLocation = Point4.Center;

        var readyBtnWidth : int;
        var readyBtnHeight : int;
        var readyOffset : int;
        //Ready Button
        if(Screen.height < 500) {
            readyBtnWidth = 90;
            readyBtnHeight = 30;
            GuiReady.textureWidth = 90;
            GuiReady.textureHeight = 30;
            readyOffset = 30;
        } 

        else if(Screen.height > 500) {
            readyBtnWidth = 200;
            readyBtnHeight = 50;
            GuiReady.textureWidth = 200;
            GuiReady.textureHeight = 50;
            readyOffset = 50;
        }


        if(GUI.Button(Rect(GuiReady.offset.x,Screen.height - readyOffset - (Screen.height*0.1), readyBtnWidth, readyBtnHeight), "Ready")){
          if(selectMenu == "quick"){
            leaveFor(menus.quickplay);
          } else if (selectMenu == "join") leaveFor(menus.lobby);
            else if (selectMenu == "newGame") leaveFor(menus.host);
        }
        

        GuiBack.updateLocation();
        GuiReady.updateLocation();
        GuiCharacter[0].updateLocation();

    } else {
        //Show main menu if Character Selection isn't true
    
        GUILayout.Label("Main Menu");
        GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());

         if(GUI.Button(Rect(Gui.offset.x,Gui.offset.y,130,160), quickGameTexture)){
            //leaveFor(menus.quickplay);
            characterSelect = true;
            selectMenu = "quick";
         }

         if(GUI.Button(Rect(Gui.offset.x + 150,Gui.offset.y,150,70), newGameTexture)){
            //leaveFor(menus.host);
            characterSelect = true;
            selectMenu = "newGame";
         }

         if(GUI.Button(Rect(Gui.offset.x + 150,Gui.offset.y + 90,150,70), joinGameTexture)){
            //leaveFor(menus.lobby);
            characterSelect = true;
            selectMenu = "join";
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
